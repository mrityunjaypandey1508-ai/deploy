const Dispute = require('../models/Dispute');
// Agreements removed in CivicSync
const User = require('../models/User');
const { sendDisputeEmail } = require('../utils/notifications');

// Create dispute
const createDispute = async (req, res) => {
  try {
    const {
      agreementId,
      againstId,
      type,
      title,
      description,
      evidence
    } = req.body;

    const raisedBy = req.user._id;

    // Verify agreement exists and user is part of it
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { user1: raisedBy },
        { user2: raisedBy }
      ],
      status: 'active'
    });

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Verify against user is the partner
    const partnerId = agreement.user1.toString() === raisedBy.toString() 
      ? agreement.user2 
      : agreement.user1;

    if (partnerId.toString() !== againstId) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({
      agreement: agreementId,
      raisedBy,
      status: { $in: ['open', 'under_review'] }
    });

    if (existingDispute) {
      return res.status(400).json({ message: 'Dispute already exists for this agreement' });
    }

    // Create dispute
    const dispute = new Dispute({
      agreement: agreementId,
      raisedBy,
      against: againstId,
      type,
      title,
      description,
      evidence: evidence || []
    });

    await dispute.save();

    // Send email notification to partner (disabled)
    const againstUser = await User.findById(againstId);
    await sendDisputeEmail(againstUser, dispute);

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ message: 'Failed to create dispute' });
  }
};

// Get user disputes
const getUserDisputes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type } = req.query;

    let query = {
      $or: [
        { raisedBy: userId },
        { against: userId }
      ]
    };

    if (status) query.status = status;
    if (type) query.type = type;

    const disputes = await Dispute.find(query)
      .populate('agreement', 'what when')
      .populate('raisedBy', 'name avatar')
      .populate('against', 'name avatar')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({ disputes });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ message: 'Failed to get disputes' });
  }
};

// Get dispute by ID
const getDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user._id;

    const dispute = await Dispute.findOne({
      _id: disputeId,
      $or: [
        { raisedBy: userId },
        { against: userId }
      ]
    }).populate('agreement', 'what when user1 user2')
      .populate('raisedBy', 'name avatar')
      .populate('against', 'name avatar')
      .populate('assignedTo', 'name')
      .populate('resolvedBy', 'name')
      .populate('messages.from', 'name avatar');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    res.json({ dispute });
  } catch (error) {
    console.error('Get dispute error:', error);
    res.status(500).json({ message: 'Failed to get dispute' });
  }
};

// Add message to dispute
const addMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const dispute = await Dispute.findOne({
      _id: disputeId,
      $or: [
        { raisedBy: userId },
        { against: userId }
      ],
      status: { $in: ['open', 'under_review'] }
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found or closed' });
    }

    await dispute.addMessage(userId, message);

    res.json({
      message: 'Message added successfully',
      dispute
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
};

// Close dispute (only by involved parties)
const closeDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const userId = req.user._id;

    const dispute = await Dispute.findOne({
      _id: disputeId,
      $or: [
        { raisedBy: userId },
        { against: userId }
      ],
      status: { $in: ['open', 'under_review'] }
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found or already closed' });
    }

    dispute.status = 'closed';
    await dispute.save();

    res.json({
      message: 'Dispute closed successfully',
      dispute
    });
  } catch (error) {
    console.error('Close dispute error:', error);
    res.status(500).json({ message: 'Failed to close dispute' });
  }
};

// Get dispute statistics
const getDisputeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Dispute.aggregate([
      {
        $match: {
          $or: [
            { raisedBy: userId },
            { against: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDisputes = await Dispute.countDocuments({
      $or: [
        { raisedBy: userId },
        { against: userId }
      ]
    });

    const resolvedDisputes = await Dispute.countDocuments({
      $or: [
        { raisedBy: userId },
        { against: userId }
      ],
      status: 'resolved'
    });

    res.json({
      stats,
      totalDisputes,
      resolvedDisputes,
      resolutionRate: totalDisputes > 0 ? (resolvedDisputes / totalDisputes) * 100 : 0
    });
  } catch (error) {
    console.error('Get dispute stats error:', error);
    res.status(500).json({ message: 'Failed to get dispute statistics' });
  }
};

module.exports = {
  createDispute,
  getUserDisputes,
  getDispute,
  addMessage,
  closeDispute,
  getDisputeStats
};







