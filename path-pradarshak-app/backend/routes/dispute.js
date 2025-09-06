const express = require('express');
const { body } = require('express-validator');
const disputeController = require('../controllers/disputeController');

const router = express.Router();

// Validation middleware
const validateDispute = [
  body('agreementId').isMongoId().withMessage('Valid agreement ID is required'),
  body('againstId').isMongoId().withMessage('Valid partner ID is required'),
  body('type').isIn(['progress_dispute', 'payment_dispute', 'behavior_dispute', 'other']).withMessage('Valid dispute type is required'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('evidence').optional().isArray().withMessage('Evidence must be an array')
];

const validateMessage = [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
];

// Routes
router.post('/', validateDispute, disputeController.createDispute);
router.get('/', disputeController.getUserDisputes);
router.get('/stats', disputeController.getDisputeStats);
router.get('/:disputeId', disputeController.getDispute);
router.post('/:disputeId/messages', validateMessage, disputeController.addMessage);
router.put('/:disputeId/close', disputeController.closeDispute);

module.exports = router;







