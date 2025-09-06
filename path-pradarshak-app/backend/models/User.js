const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  goals: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Role-based access: citizen (default), official, admin
  role: {
    type: String,
    enum: ['citizen', 'official', 'admin'],
    default: 'citizen'
  },
  // Optional department details for government officials
  department: {
    name: { type: String, trim: true },
    code: { type: String, trim: true }
  },
  // Engagement stats used for rewards/badges
  stats: {
    reportsCount: { type: Number, default: 0 },
    actionsTaken: { type: Number, default: 0 },
    communityLevel: { type: Number, default: 1 },
    points: { type: Number, default: 0 }
  },
  // Earned badges to display on profile
  badges: [{
    name: { type: String, required: true },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    earnedAt: { type: Date, default: Date.now }
  }],
  refreshToken: {
    type: String
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Public profile method (excludes sensitive data)
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.email;
  delete user.phone;
  return user;
};

module.exports = mongoose.model('User', userSchema);


