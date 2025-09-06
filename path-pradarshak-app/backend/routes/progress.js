const express = require('express');
const { body } = require('express-validator');
const progressController = require('../controllers/progressController');

const router = express.Router();

// Validation middleware
const validateProgressSubmission = [
  body('agreementId').isMongoId().withMessage('Valid agreement ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['completed', 'partial', 'missed']).withMessage('Valid status is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('hoursSpent').optional().isFloat({ min: 0 }).withMessage('Hours spent must be a positive number'),
  body('completionPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Completion percentage must be between 0 and 100'),
  body('challenges').optional().isLength({ max: 500 }).withMessage('Challenges must be less than 500 characters'),
  body('nextSteps').optional().isLength({ max: 500 }).withMessage('Next steps must be less than 500 characters')
];

const validateProgressUpdate = [
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('hoursSpent').optional().isFloat({ min: 0 }).withMessage('Hours spent must be a positive number'),
  body('completionPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Completion percentage must be between 0 and 100'),
  body('challenges').optional().isLength({ max: 500 }).withMessage('Challenges must be less than 500 characters'),
  body('nextSteps').optional().isLength({ max: 500 }).withMessage('Next steps must be less than 500 characters')
];

// Routes
router.post('/', validateProgressSubmission, progressController.submitProgress);
router.get('/agreement/:agreementId', progressController.getAgreementProgress);
router.get('/summary', progressController.getProgressSummary);
router.get('/missed', progressController.getMissedCheckins);
router.get('/verification-queue', progressController.getVerificationQueue);
router.put('/:progressId', validateProgressUpdate, progressController.updateProgress);
router.put('/:progressId/verify', progressController.verifyProgress);
router.post('/:progressId/verify', progressController.verifyProgress);

module.exports = router;







