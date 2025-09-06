const Wallet = require('../models/Wallet');
const User = require('../models/User');

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        transactions: []
      });
      await wallet.save();
    }
    
    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ message: 'Failed to get wallet balance' });
  }
};

// Add funds to wallet (e.g., after successful payment)
const addFunds = async (req, res) => {
  try {
    const { userId, amount, description, agreementId, paymentId } = req.body;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        transactions: []
      });
    }
    
    // Add funds
    wallet.balance += amount;
    
    // Add transaction record
    wallet.transactions.push({
      type: 'deposit',
      amount,
      description,
      agreementId,
      paymentId,
      timestamp: new Date()
    });
    
    await wallet.save();
    
    res.json({ 
      message: 'Funds added successfully',
      newBalance: wallet.balance 
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
};

// Deduct funds from wallet (e.g., penalties)
const deductFunds = async (req, res) => {
  try {
    const { userId, amount, description, agreementId } = req.body;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // Deduct funds
    wallet.balance -= amount;
    
    // Add transaction record
    wallet.transactions.push({
      type: 'penalty',
      amount: -amount,
      description,
      agreementId,
      timestamp: new Date()
    });
    
    await wallet.save();
    
    res.json({ 
      message: 'Funds deducted successfully',
      newBalance: wallet.balance 
    });
  } catch (error) {
    console.error('Deduct funds error:', error);
    res.status(500).json({ message: 'Failed to deduct funds' });
  }
};

// Get wallet transactions
const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.json({ transactions: [], total: 0 });
    }
    
    const transactions = wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);
    
    res.json({
      transactions,
      total: wallet.transactions.length,
      currentBalance: wallet.balance
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ message: 'Failed to get wallet transactions' });
  }
};

module.exports = {
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletTransactions
};

