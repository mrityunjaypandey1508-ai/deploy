const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getAllIssuesAdmin,
  getMyIssues,
  getIssue,
  updateIssueStatus,
  addComment,
  toggleUpvote,
  getIssueStats
} = require('../controllers/issueController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create the upload middleware
const uploadMiddleware = upload.array('images', 5);

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', authenticateToken, uploadMiddleware, createIssue);

// @route   GET /api/issues
// @desc    Get all issues
// @access  Public
router.get('/', getAllIssues);

// @route   GET /api/issues/admin
// @desc    Get all issues (Officials/Admin)
// @access  Private (Official/Admin)
router.get('/admin', authenticateToken, requireRole(['official', 'admin']), getAllIssuesAdmin);

// @route   GET /api/issues/my-issues
// @desc    Get user's issues
// @access  Private
router.get('/my-issues', authenticateToken, getMyIssues);

// @route   GET /api/issues/stats
// @desc    Get issue statistics
// @access  Public
router.get('/stats', getIssueStats);

// @route   GET /api/issues/:id
// @desc    Get single issue
// @access  Public
router.get('/:id', getIssue);

// @route   PUT /api/issues/:id/status
// @desc    Update issue status
// @access  Private (Official/Admin)
router.put('/:id/status', authenticateToken, requireRole(['official', 'admin']), updateIssueStatus);

// @route   POST /api/issues/:id/comments
// @desc    Add comment to issue
// @access  Private
router.post('/:id/comments', authenticateToken, addComment);

// @route   POST /api/issues/:id/upvote
// @desc    Toggle upvote for issue
// @access  Private
router.post('/:id/upvote', authenticateToken, toggleUpvote);

module.exports = router;
