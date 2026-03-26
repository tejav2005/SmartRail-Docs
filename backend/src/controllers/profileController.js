const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user.toSafeObject(),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const allowedFields = ['name', 'email', 'department', 'phone', 'avatarUrl'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.body.settings) {
    user.settings = {
      ...user.settings,
      ...req.body.settings,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user.toSafeObject(),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
