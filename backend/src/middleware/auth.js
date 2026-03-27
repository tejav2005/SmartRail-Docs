const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token is missing', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Authorization token has expired', 401);
    }

    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Authorization token is invalid', 401);
    }

    throw error;
  }

  const user = await User.findById(decoded.userId || decoded.sub);

  if (!user) {
    throw new AppError('User associated with token no longer exists', 401);
  }

  if (!user.department && decoded.department) {
    user.department = decoded.department;
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
};
