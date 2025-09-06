const express = require('express');
const { body } = require('express-validator');
const connectionController = require('../controllers/connectionController');

const router = express.Router();

// Validation middleware
const validateConnectionRequest = [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message must be less than 500 characters')
];

// Routes
router.post('/request', validateConnectionRequest, connectionController.sendRequest);
router.post('/bulk-status', connectionController.getBulkConnectionStatus);
router.get('/received', connectionController.getReceivedRequests);
router.get('/sent', connectionController.getSentRequests);
router.get('/active', connectionController.getActiveConnections);
router.get('/partners', connectionController.getPartners);
router.get('/status/:userId', connectionController.getConnectionStatus);
router.put('/accept/:connectionId', connectionController.acceptRequest);
router.put('/reject/:connectionId', connectionController.rejectRequest);
router.delete('/cancel/:connectionId', connectionController.cancelRequest);
router.put('/block/:userId', connectionController.blockUser);
router.post('/cleanup-duplicates', connectionController.cleanupDuplicateConnections);

module.exports = router;






