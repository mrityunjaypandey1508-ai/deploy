const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agreement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agreement',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'partial', 'missed'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  hoursSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  challenges: {
    type: String,
    maxlength: 500,
    default: ''
  },
  nextSteps: {
    type: String,
    maxlength: 500,
    default: ''
  },
  evidence: {
    type: String, // URL to uploaded evidence
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  penaltyApplied: {
    type: Boolean,
    default: false
  },
  penaltyAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure unique progress entries per user per agreement per date
progressSchema.index({ user: 1, agreement: 1, date: 1 }, { unique: true });

// Index for efficient queries
progressSchema.index({ agreement: 1, date: 1 });
progressSchema.index({ user: 1, status: 1 });

// Virtual for checking if progress is on time
progressSchema.virtual('isOnTime').get(function() {
  const today = new Date();
  const progressDate = new Date(this.date);
  const diffTime = Math.abs(today - progressDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 1; // Allow 1 day grace period
});

// Method to apply penalty
progressSchema.methods.applyPenalty = async function() {
  if (this.status === 'missed' && !this.penaltyApplied) {
    this.penaltyApplied = true;
    this.penaltyAmount = 100; // ₹100 penalty for missed day
    
    try {
      // Deduct penalty from user's wallet
      const Wallet = require('./Wallet');
      let wallet = await Wallet.findOne({ user: this.user });
      
      if (wallet && wallet.balance >= this.penaltyAmount) {
        wallet.balance -= this.penaltyAmount;
        
        // Add penalty transaction record
        wallet.transactions.push({
          type: 'penalty',
          amount: -this.penaltyAmount,
          description: `Penalty for missed progress on ${this.date.toLocaleDateString()}`,
          agreementId: this.agreement,
          timestamp: new Date()
        });
        
        await wallet.save();
        console.log(`Applied ₹${this.penaltyAmount} penalty to user ${this.user}`);
      } else {
        console.log(`Insufficient funds for penalty: user ${this.user}, balance: ${wallet?.balance || 0}`);
      }
    } catch (error) {
      console.error('Failed to apply penalty to wallet:', error);
    }
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to verify progress
progressSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Progress', progressSchema);


