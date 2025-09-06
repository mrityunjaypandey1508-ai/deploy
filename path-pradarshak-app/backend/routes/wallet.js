const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// Get wallet balance
router.get('/balance', authenticateToken, walletController.getWalletBalance);

// Add funds to wallet (admin/internal use)
router.post('/add-funds', authenticateToken, walletController.addFunds);

// Deduct funds from wallet (for penalties)
router.post('/deduct-funds', authenticateToken, walletController.deductFunds);

// Get wallet transactions
router.get('/transactions', authenticateToken, walletController.getWalletTransactions);

module.exports = router;

