const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { signToken } = require('../services/tokenService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const signup = asyncHandler(async (req, res) => {
  const { name, email, employeeId, password, department, role } = req.body;
  const normalizedEmployeeId = employeeId?.trim().toUpperCase();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name || !normalizedEmployeeId || !password) {
    throw new AppError('Name, employee ID, and password are required', 400);
  }

  const uniquenessChecks = [{ employeeId: normalizedEmployeeId }];
  if (normalizedEmail) {
    uniquenessChecks.push({ email: normalizedEmail });
  }

  const existingUser = await User.findOne({ $or: uniquenessChecks });

  if (existingUser) {
    throw new AppError('User already exists with this employee ID or email', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    employeeId: normalizedEmployeeId,
    department,
    role: role || 'staff',
    password: passwordHash,
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { employeeId, email, password } = req.body;
  const normalizedEmployeeId = employeeId?.trim().toUpperCase();
  const normalizedEmail = email?.trim().toLowerCase();

  if ((!normalizedEmployeeId && !normalizedEmail) || !password) {
    throw new AppError('Employee ID or email, and password are required', 400);
  }

  const user = await User.findOne(
    normalizedEmployeeId ? { employeeId: normalizedEmployeeId } : { email: normalizedEmail }
  ).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
});

module.exports = {
  signup,
  login,
};
