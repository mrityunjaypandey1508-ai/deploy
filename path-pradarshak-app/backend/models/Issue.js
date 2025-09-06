const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Potholes',
      'Broken Street Lights',
      'Garbage Collection',
      'Water Issues',
      'Road Damage',
      'Public Safety',
      'Traffic Issues',
      'Other'
    ]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resolvedAt: {
    type: Date
  },
  estimatedResolutionDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isOfficial: {
      type: Boolean,
      default: false
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ location: 'text', title: 'text', description: 'text' });

// Virtual for upvote count
issueSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for comment count
issueSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to add upvote
issueSchema.methods.addUpvote = function(userId) {
  if (!this.upvotes.includes(userId)) {
    this.upvotes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove upvote
issueSchema.methods.removeUpvote = function(userId) {
  this.upvotes = this.upvotes.filter(id => !id.equals(userId));
  return this.save();
};

// Method to add comment
issueSchema.methods.addComment = function(userId, text, isOfficial = false) {
  this.comments.push({
    user: userId,
    text: text,
    isOfficial: isOfficial
  });
  return this.save();
};

// Method to update status
issueSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  }
  if (notes) {
    this.resolutionNotes = notes;
  }
  return this.save();
};

// Static method to get issues by status
issueSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('reportedBy', 'name email').sort({ createdAt: -1 });
};

// Static method to get issues by category
issueSchema.statics.getByCategory = function(category) {
  return this.find({ category, status: { $ne: 'closed' } }).populate('reportedBy', 'name email').sort({ createdAt: -1 });
};

// Static method to search issues
issueSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } }
    ]
  }).populate('reportedBy', 'name email').sort({ createdAt: -1 });
};

module.exports = mongoose.model('Issue', issueSchema);

