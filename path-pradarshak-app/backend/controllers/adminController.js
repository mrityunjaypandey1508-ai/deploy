const User = require('../models/User');
// Agreements removed in CivicSync
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const Progress = require('../models/Progress');
const { requireAdmin } = require('../middleware/auth');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    // Get agreement statistics
    const totalAgreements = await Agreement.countDocuments();
    const pendingAgreements = await Agreement.countDocuments({ status: 'pending' });
    const activeAgreements = await Agreement.countDocuments({ status: 'active' });
    const completedAgreements = await Agreement.countDocuments({ status: 'completed' });

    // Get payment statistics
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get dispute statistics
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });

    // Get progress statistics
    const totalProgressEntries = await Progress.countDocuments();
    const completedProgress = await Progress.countDocuments({ status: 'completed' });
    const missedProgress = await Progress.countDocuments({ status: 'missed' });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      },
      agreements: {
        total: totalAgreements,
        pending: pendingAgreements,
        active: activeAgreements,
        completed: completedAgreements,
        completionRate: totalAgreements > 0 ? ((completedAgreements / totalAgreements) * 100).toFixed(2) : 0
      },
      payments: {
        total: totalPayments,
        revenue: totalRevenue[0]?.total || 0
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
        resolved: resolvedDisputes,
        resolutionRate: totalDisputes > 0 ? ((resolvedDisputes / totalDisputes) * 100).toFixed(2) : 0
      },
      progress: {
        total: totalProgressEntries,
        completed: completedProgress,
        missed: missedProgress,
        completionRate: totalProgressEntries > 0 ? ((completedProgress / totalProgressEntries) * 100).toFixed(2) : 0
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get dashboard statistics' });
  }
};

// Get all disputes (admin view)
const getAllDisputes = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const disputes = await Dispute.find(query)
      .populate('agreement', 'what when user1 user2')
      .populate('raisedBy', 'name email')
      .populate('against', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + disputes.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all disputes error:', error);
    res.status(500).json({ message: 'Failed to get disputes' });
  }
};

// Assign dispute to admin
const assignDispute = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.assignedTo = req.user._id;
    dispute.status = 'under_review';
    await dispute.save();

    res.json({
      message: 'Dispute assigned successfully',
      dispute
    });
  } catch (error) {
    console.error('Assign dispute error:', error);
    res.status(500).json({ message: 'Failed to assign dispute' });
  }
};

// Resolve dispute (admin only)
const resolveDispute = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { disputeId } = req.params;
    const { resolution, outcome, penaltyAmount, refundAmount } = req.body;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    await dispute.resolve(req.user._id, resolution, outcome, penaltyAmount, refundAmount);

    res.json({
      message: 'Dispute resolved successfully',
      dispute
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Failed to resolve dispute' });
  }
};

// Get all users (admin view)
const getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

// Get user details (admin view)
const getUserDetails = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's agreements
    const agreements = await Agreement.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).populate('user1', 'name').populate('user2', 'name');

    // Get user's payments
    const payments = await Payment.find({ user: userId })
      .populate('agreement', 'what');

    // Get user's disputes
    const disputes = await Dispute.find({
      $or: [{ raisedBy: userId }, { against: userId }]
    }).populate('agreement', 'what');

    res.json({
      user,
      agreements,
      payments,
      disputes
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Failed to get user details' });
  }
};

// Get all payments (admin view)
const getAllPayments = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { type, status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('agreement', 'what')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + payments.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Failed to get payments' });
  }
};

// Ban/unban user
const toggleUserBan = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    const { isBanned, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For now, we'll use a custom field to track banned status
    // In a real implementation, you might want to add an isBanned field to the User model
    user.isBanned = isBanned;
    user.banReason = reason;
    user.bannedAt = isBanned ? new Date() : null;
    user.bannedBy = isBanned ? req.user._id : null;

    await user.save();

    res.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

module.exports = {
  getDashboardStats,
  getAllDisputes,
  assignDispute,
  resolveDispute,
  getAllUsers,
  getUserDetails,
  getAllPayments,
  toggleUserBan
};







