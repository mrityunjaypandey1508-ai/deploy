const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'penalty', 'reward', 'refund'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
walletSchema.index({ user: 1 });

module.exports = mongoose.model('Wallet', walletSchema);

