const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['deposit', 'penalty', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: String
  },
  processedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, agreement: 1, type: 1 });
paymentSchema.index({ status: 1, createdAt: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount}`;
});

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(paymentId, signature) {
  this.status = 'completed';
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.processedAt = new Date();
  return this.save();
};

// Method to mark payment as refunded
paymentSchema.methods.markRefunded = function() {
  this.status = 'refunded';
  this.refundedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);


