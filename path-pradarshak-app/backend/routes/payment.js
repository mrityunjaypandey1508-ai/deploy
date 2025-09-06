const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Validation middleware
const validateDepositOrder = [
  body('agreementId').isMongoId().withMessage('Valid agreement ID is required')
];

const validatePenaltyPayment = [
  body('agreementId').isMongoId().withMessage('Valid agreement ID is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

const validateRefund = [
  body('paymentId').isMongoId().withMessage('Valid payment ID is required'),
  body('amount').isInt({ min: 1 }).withMessage('Valid amount is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required')
];

// Routes
router.get('/test-config', paymentController.testRazorpayConfig); // Test Razorpay configuration
router.post('/deposit', validateDepositOrder, paymentController.createDepositOrder);
router.post('/verify', paymentController.verifyPaymentWebhook);
router.post('/test-verify', paymentController.testPaymentVerification); // Test endpoint
router.post('/reset-status', validateDepositOrder, paymentController.resetPaymentStatus); // Reset payment status
router.get('/debug/:agreementId', paymentController.debugPaymentState); // Debug endpoint
router.get('/', paymentController.getUserPayments);
router.get('/stats', paymentController.getPaymentStats);
router.post('/penalty', validatePenaltyPayment, paymentController.createPenaltyPayment);
router.post('/refund', validateRefund, paymentController.processRefundPayment);

module.exports = router;


