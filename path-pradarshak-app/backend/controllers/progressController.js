const Progress = require('../models/Progress');
// Agreements removed in CivicSync
const { sendProgressUpdateNotification } = require('../utils/notifications');
const fs = require('fs');
const path = require('path');

// Submit daily progress
const submitProgress = async (req, res) => {
  try {
    const {
      agreementId,
      date,
      status,
      description,
      hoursSpent,
      completionPercentage,
      challenges,
      nextSteps,
      evidence
    } = req.body;

    const userId = req.user._id;

    console.log('Submitting progress:', {
      agreementId,
      userId,
      date,
      status,
      description: description?.substring(0, 50) + '...'
    });

    // Verify agreement exists and user is part of it
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: 'active'
    });

    if (!agreement) {
      console.log('Agreement not found for progress submission');
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Check if both users have paid before allowing progress submission
    if (!agreement.paymentStatus.user1Paid || !agreement.paymentStatus.user2Paid) {
      console.log('Agreement payment not completed for progress submission');
      return res.status(403).json({ 
        message: 'Progress submission is not allowed until both users have completed payment',
        paymentRequired: true
      });
    }

    // Auto-start tracking if both users have paid but trackingStartDate is missing
    if (!agreement.trackingStartDate && agreement.paymentStatus.user1Paid && agreement.paymentStatus.user2Paid) {
      agreement.trackingStartDate = new Date();
      await agreement.save();
      console.log('Auto-set trackingStartDate on progress submission');
    }

    // Check if tracking has started (both users have paid)
    if (!agreement.trackingStartDate) {
      console.log('Tracking has not started yet for this agreement');
      return res.status(403).json({ 
        message: 'Progress tracking has not started yet. Please wait for both users to complete payment.',
        trackingNotStarted: true
      });
    }

    // Check if the progress date is before tracking start date
    const progressDate = new Date(date);
    const trackingStart = new Date(agreement.trackingStartDate);
    // Normalize both to start of day to compare calendar dates only
    progressDate.setHours(0, 0, 0, 0);
    trackingStart.setHours(0, 0, 0, 0);
    if (progressDate < trackingStart) {
      console.log('Progress date is before tracking start date');
      return res.status(400).json({ 
        message: `Progress cannot be submitted for dates before tracking started (${trackingStart.toLocaleDateString()})`,
        invalidDate: true
      });
    }

    console.log('Agreement found for progress submission:', agreement._id);

    // Check if progress already exists for this date
    const existingProgress = await Progress.findOne({
      user: userId,
      agreement: agreementId,
      date: new Date(date)
    });

    if (existingProgress) {
      console.log('Progress already exists for this date');
      return res.status(400).json({ message: 'Progress already submitted for this date' });
    }

    // Create progress entry
    const progress = new Progress({
      user: userId,
      agreement: agreementId,
      date: new Date(date),
      status,
      description,
      hoursSpent,
      completionPercentage,
      challenges,
      nextSteps,
      evidence: ''
    });

    // If evidence is a base64 data URL, save it to disk and set URL
    try {
      if (typeof evidence === 'string' && evidence.startsWith('data:image/')) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = evidence.substring(evidence.indexOf('/') + 1, evidence.indexOf(';')) || 'png';
        const base64Data = evidence.substring(evidence.indexOf(',') + 1);
        const fileName = `evidence_${progress._id}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        // Expose via static path
        progress.evidence = `/uploads/${fileName}`;
      } else if (typeof evidence === 'string') {
        // already a URL
        progress.evidence = evidence;
      }
    } catch (e) {
      console.error('Failed saving evidence image:', e);
    }

    await progress.save();
    console.log('Progress saved successfully:', progress._id);

    // Apply penalty if status is 'missed'
    if (status === 'missed') {
      await progress.applyPenalty();
    }

    // Get partner ID for notification
    const partnerId = agreement.user1.toString() === userId.toString() 
      ? agreement.user2 
      : agreement.user1;

    // Send real-time notification to partner
    const io = req.app.get('io');
    sendProgressUpdateNotification(io, partnerId, {
      agreementId,
      partnerName: req.user.name,
      status,
      date: progress.date,
      completionPercentage
    });

    res.status(201).json({
      message: 'Progress submitted successfully',
      progress
    });
  } catch (error) {
    console.error('Submit progress error:', error);
    res.status(500).json({ message: 'Failed to submit progress' });
  }
};

// Get progress for agreement
const getAgreementProgress = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user._id;

    console.log('Getting progress for agreement:', agreementId, 'user:', userId);

    // Verify agreement exists and user is part of it
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    });

    if (!agreement) {
      console.log('Agreement not found for user');
      return res.status(404).json({ message: 'Agreement not found' });
    }

    console.log('Agreement found:', agreement._id);

    const progress = await Progress.find({
      agreement: agreementId
    }).populate('user', 'name avatar')
      .sort({ date: -1 });

    console.log('Found progress entries:', progress.length);
    console.log('Progress data:', progress);

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to get progress' });
  }
};

// Get user's progress summary
const getProgressSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agreementId, startDate, endDate } = req.query;

    console.log('Getting progress summary for user:', userId, 'agreementId:', agreementId);

    let query = { user: userId };

    if (agreementId) {
      query.agreement = agreementId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log('Progress query:', query);

    const progress = await Progress.find(query)
      .populate('agreement', 'what')
      .sort({ date: -1 });

    console.log('Found progress for summary:', progress.length);

    // Calculate summary statistics
    const totalEntries = progress.length;
    const completedEntries = progress.filter(p => p.status === 'completed').length;
    const missedEntries = progress.filter(p => p.status === 'missed').length;
    const totalHours = progress.reduce((sum, p) => sum + (p.hoursSpent || 0), 0);
    const totalPenalties = progress.reduce((sum, p) => sum + (p.penaltyAmount || 0), 0);

    const summary = {
      totalEntries,
      completedEntries,
      missedEntries,
      completionRate: totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0,
      totalHours,
      totalPenalties,
      progress
    };

    console.log('Progress summary:', summary);

    res.json({ summary });
  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({ message: 'Failed to get progress summary' });
  }
};

// Update progress entry
const updateProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const progress = await Progress.findOne({
      _id: progressId,
      user: userId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Only allow updates to certain fields
    const allowedUpdates = ['description', 'hoursSpent', 'completionPercentage', 'challenges', 'nextSteps', 'evidence'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdates[field] = updateData[field];
      }
    });

    const updatedProgress = await Progress.findByIdAndUpdate(
      progressId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Progress updated successfully',
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};

// Verify partner's progress
const verifyProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const userId = req.user._id;
    const { action } = req.body || {};

    // Find progress entry
    const progress = await Progress.findById(progressId)
      .populate('agreement', 'user1 user2');

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Verify user is the partner
    const agreement = progress.agreement;
    if (agreement.user1.toString() !== userId.toString() && 
        agreement.user2.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to verify this progress' });
    }

    if (action === 'reject') {
      progress.isVerified = false;
      progress.isRejected = true;
      progress.verifiedBy = userId;
      progress.verifiedAt = new Date();
      await progress.save();
      return res.json({ message: 'Progress rejected successfully', progress });
    }

    // Approve path
    await progress.verify(userId);
    progress.isRejected = false;
    await progress.save();

    // Add reward to the partner who verified the progress
    try {
      const Wallet = require('../models/Wallet');
      let partnerWallet = await Wallet.findOne({ user: userId });
      
      if (!partnerWallet) {
        partnerWallet = new Wallet({
          user: userId,
          balance: 0,
          transactions: []
        });
      }
      
      // Add ₹25 reward for verifying partner's progress
      const rewardAmount = 25;
      partnerWallet.balance += rewardAmount;
      
      // Add reward transaction record
      partnerWallet.transactions.push({
        type: 'reward',
        amount: rewardAmount,
        description: `Reward for verifying partner's progress on ${progress.date.toLocaleDateString()}`,
        agreementId: progress.agreement._id,
        timestamp: new Date()
      });
      
      await partnerWallet.save();
      console.log(`Added ₹${rewardAmount} reward to user ${userId} for verifying progress`);
    } catch (walletError) {
      console.error('Failed to add reward to wallet:', walletError);
      // Don't fail the verification if wallet update fails
    }

    res.json({
      message: 'Progress verified successfully',
      progress
    });
  } catch (error) {
    console.error('Verify progress error:', error);
    res.status(500).json({ message: 'Failed to verify progress' });
  }
};

// Get missed check-ins for penalty calculation
const getMissedCheckins = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agreementId } = req.query;

    let query = { user: userId, status: 'missed' };

    if (agreementId) {
      query.agreement = agreementId;
    }

    const missedCheckins = await Progress.find(query)
      .populate('agreement', 'what when')
      .sort({ date: -1 });

    res.json({ missedCheckins });
  } catch (error) {
    console.error('Get missed checkins error:', error);
    res.status(500).json({ message: 'Failed to get missed check-ins' });
  }
};

// Get verification queue for current user
const getVerificationQueue = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agreementId } = req.query;

    let agreementsFilter = {};
    if (agreementId) {
      agreementsFilter = { _id: agreementId };
    }

    // Find agreements where current user participates
    const agreements = await Agreement.find({
      ...agreementsFilter,
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    }).select('_id user1 user2');

    const agreementIds = agreements.map(a => a._id);

    // Find partner submissions awaiting verification
    const queue = await Progress.find({
      agreement: { $in: agreementIds },
      user: { $ne: userId },
      isVerified: false,
      isRejected: false
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const items = queue.map(p => ({
      _id: p._id,
      partnerName: p.user?.name || 'Partner',
      taskDescription: p.description || 'No description',
      submissionTime: p.createdAt?.toLocaleString() || '',
      timeLeft: '24h',
      evidence: p.evidence || ''
    }));

    res.json({ queue: items });
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({ message: 'Failed to get verification queue' });
  }
};

module.exports = {
  submitProgress,
  getAgreementProgress,
  getProgressSummary,
  updateProgress,
  verifyProgress,
  getMissedCheckins,
  getVerificationQueue
};







