const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  agreement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agreement',
    required: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['progress_dispute', 'payment_dispute', 'behavior_dispute', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  evidence: [{
    type: String, // URLs to uploaded evidence
    required: true
  }],
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  resolution: {
    type: String,
    maxlength: 2000
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  outcome: {
    type: String,
    enum: ['in_favor_of_complainant', 'in_favor_of_defendant', 'compromise', 'dismissed'],
    default: null
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  messages: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
disputeSchema.index({ status: 1, priority: 1, createdAt: 1 });
disputeSchema.index({ agreement: 1, status: 1 });
disputeSchema.index({ raisedBy: 1, status: 1 });

// Virtual for checking if dispute is active
disputeSchema.virtual('isActive').get(function() {
  return ['open', 'under_review'].includes(this.status);
});

// Method to add message
disputeSchema.methods.addMessage = function(from, message, isAdmin = false) {
  this.messages.push({
    from,
    message,
    isAdmin,
    createdAt: new Date()
  });
  return this.save();
};

// Method to resolve dispute
disputeSchema.methods.resolve = function(resolvedBy, resolution, outcome, penaltyAmount = 0, refundAmount = 0) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  this.outcome = outcome;
  this.penaltyAmount = penaltyAmount;
  this.refundAmount = refundAmount;
  return this.save();
};

module.exports = mongoose.model('Dispute', disputeSchema);


