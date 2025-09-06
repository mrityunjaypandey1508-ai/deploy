const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');

const router = express.Router();

// Validation middleware
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array')
];

// Routes
router.get('/', profileController.getProfile);
router.put('/', validateProfileUpdate, profileController.updateProfile);
router.get('/search', profileController.searchUsers);
router.get('/:userId', profileController.getPublicProfile);
router.post('/avatar', profileController.uploadAvatar);

module.exports = router;


