const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin access
router.use(requireAdmin);

// Validation middleware
const validateDisputeResolution = [
  body('resolution').trim().isLength({ min: 10, max: 2000 }).withMessage('Resolution must be between 10 and 2000 characters'),
  body('outcome').isIn(['in_favor_of_complainant', 'in_favor_of_defendant', 'compromise', 'dismissed']).withMessage('Valid outcome is required'),
  body('penaltyAmount').optional().isFloat({ min: 0 }).withMessage('Penalty amount must be a positive number'),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be a positive number')
];

const validateUserBan = [
  body('isBanned').isBoolean().withMessage('isBanned must be a boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
];

// Routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/disputes', adminController.getAllDisputes);
router.put('/disputes/:disputeId/assign', adminController.assignDispute);
router.put('/disputes/:disputeId/resolve', validateDisputeResolution, adminController.resolveDispute);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/ban', validateUserBan, adminController.toggleUserBan);
router.get('/payments', adminController.getAllPayments);

module.exports = router;







