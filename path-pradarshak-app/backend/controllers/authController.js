const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/notifications');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email (disabled)
    await sendWelcomeEmail(user);

    // Return user data (without password)
    const userResponse = user.toPublicJSON();

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save();

    // Return user data (without password)
    const userResponse = user.toPublicJSON();

    res.json({
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    user.lastActive = new Date();
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
};

// Google OAuth placeholder (for future implementation)
const googleAuth = async (req, res) => {
  res.status(501).json({ message: 'Google OAuth not implemented yet' });
};

// Phone OTP placeholder (for future implementation)
const sendOTP = async (req, res) => {
  res.status(501).json({ message: 'Phone OTP not implemented yet' });
};

const verifyOTP = async (req, res) => {
  res.status(501).json({ message: 'Phone OTP verification not implemented yet' });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  googleAuth,
  sendOTP,
  verifyOTP
};


