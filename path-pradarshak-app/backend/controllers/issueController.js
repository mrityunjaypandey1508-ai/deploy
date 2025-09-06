const Issue = require('../models/Issue');
const User = require('../models/User');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      priority,
      coordinates,
      isAnonymous
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required'
      });
    }

    // Create issue data
    const issueData = {
      title,
      description,
      category,
      location,
      priority: priority || 'medium',
      reportedBy: req.user.id,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true
    };

    // Add coordinates if provided
    if (coordinates) {
      try {
        const coords = JSON.parse(coordinates);
        issueData.coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      } catch (error) {
        console.log('Invalid coordinates format, skipping...');
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      issueData.images = req.files.map(file => ({
        url: `/uploads/issues/${file.filename}`,
        filename: file.filename
      }));
    }

    const issue = new Issue(issueData);
    await issue.save();

    // Populate the reportedBy field for response
    await issue.populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue',
      error: error.message
    });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
const getAllIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search
    } = req.query;

    const query = { isPublic: true };

    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: issues,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues',
      error: error.message
    });
  }
};

// @desc    Get all issues (Officials/Admin) with full filters
// @route   GET /api/issues/admin
// @access  Private (Official/Admin)
const getAllIssuesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      reportedBy,
      assignedTo
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (reportedBy) query.reportedBy = reportedBy;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: issues,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching issues (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues',
      error: error.message
    });
  }
};

// @desc    Get user's issues
// @route   GET /api/issues/my-issues
// @access  Private
const getMyIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const query = { reportedBy: req.user.id };
    if (status) query.status = status;

    const issues = await Issue.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: issues,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user issues',
      error: error.message
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue',
      error: error.message
    });
  }
};

// @desc    Update issue status (Official/Admin)
// @route   PUT /api/issues/:id/status
// @access  Private (Official/Admin)
const updateIssueStatus = async (req, res) => {
  try {
    const { status, notes, estimatedResolutionDate } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update status and related fields
    issue.status = status;
    if (notes) issue.resolutionNotes = notes;
    if (estimatedResolutionDate) issue.estimatedResolutionDate = estimatedResolutionDate;
    if (status === 'resolved') issue.resolvedAt = new Date();

    await issue.save();

    // Reward logic: officials get points for taking actions
    try {
      const actingUser = await User.findById(req.user._id);
      if (actingUser) {
        actingUser.stats.actionsTaken = (actingUser.stats?.actionsTaken || 0) + 1;
        actingUser.stats.points = (actingUser.stats?.points || 0) + 10;
        // Simple badge thresholds
        const actions = actingUser.stats.actionsTaken;
        const existing = new Set((actingUser.badges || []).map(b => b.name));
        if (actions >= 5 && !existing.has('Active Official (Bronze)')) {
          actingUser.badges.push({ name: 'Active Official (Bronze)', tier: 'bronze', description: 'Took 5 actions on issues' });
        }
        if (actions >= 25 && !existing.has('Dependable Official (Silver)')) {
          actingUser.badges.push({ name: 'Dependable Official (Silver)', tier: 'silver', description: 'Took 25 actions on issues' });
        }
        if (actions >= 100 && !existing.has('Civic Hero (Gold)')) {
          actingUser.badges.push({ name: 'Civic Hero (Gold)', tier: 'gold', description: 'Took 100 actions on issues' });
        }
        await actingUser.save();
      }
    } catch (rewardErr) {
      console.warn('Reward update failed:', rewardErr?.message);
    }

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status',
      error: error.message
    });
  }
};

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text, isOfficial = false } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    await issue.addComment(req.user.id, text, isOfficial);
    await issue.populate('comments.user', 'name email');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: issue.comments[issue.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message
    });
  }
};

// @desc    Upvote/Downvote issue
// @route   POST /api/issues/:id/upvote
// @access  Private
const toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const hasUpvoted = issue.upvotes.includes(req.user.id);
    
    if (hasUpvoted) {
      await issue.removeUpvote(req.user.id);
    } else {
      await issue.addUpvote(req.user.id);
    }

    res.json({
      success: true,
      message: hasUpvoted ? 'Upvote removed' : 'Issue upvoted',
      data: {
        upvoted: !hasUpvoted,
        upvoteCount: issue.upvoteCount
      }
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling upvote',
      error: error.message
    });
  }
};

// @desc    Get issue statistics
// @route   GET /api/issues/stats
// @access  Public
const getIssueStats = async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalIssues,
        resolvedIssues,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        statusBreakdown: stats,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching issue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue statistics',
      error: error.message
    });
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getAllIssuesAdmin,
  getMyIssues,
  getIssue,
  updateIssueStatus,
  addComment,
  toggleUpvote,
  getIssueStats
};
