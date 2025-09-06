const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      avatar,
      skills,
      goals,
      interests,
      bio,
      location
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (skills) updateData.skills = skills;
    if (goals) updateData.goals = goals;
    if (interests) updateData.interests = interests;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get public profile by ID
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshToken -email -phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q, skills, goals, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { _id: { $ne: req.user._id } }; // Exclude current user

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { goals: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillArray };
    }

    if (goals) {
      const goalArray = goals.split(',').map(goal => goal.trim());
      query.goals = { $in: goalArray };
    }

    const users = await User.find(query)
      .select('-password -refreshToken -email -phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

// Upload avatar (placeholder for file upload)
const uploadAvatar = async (req, res) => {
  try {
    // This would typically handle file upload to cloud storage
    // For now, we'll just return a placeholder
    const avatarUrl = req.body.avatarUrl || '';
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -refreshToken');

    res.json({
      message: 'Avatar updated successfully',
      user
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile,
  searchUsers,
  uploadAvatar
};


