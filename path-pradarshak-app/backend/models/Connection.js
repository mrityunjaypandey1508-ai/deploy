const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique connections between any two users (both directions)
// We'll handle this in the application logic since MongoDB can't enforce bidirectional uniqueness
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Add compound index for better query performance
connectionSchema.index({ status: 1, recipient: 1 });
connectionSchema.index({ status: 1, requester: 1 });

// Virtual for checking if connection is active
connectionSchema.virtual('isActive').get(function() {
  return this.status === 'accepted';
});

// Method to get the other user in the connection
connectionSchema.methods.getOtherUser = function(userId) {
  if (this.requester.toString() === userId.toString()) {
    return this.recipient;
  }
  return this.requester;
};

module.exports = mongoose.model('Connection', connectionSchema);


