const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      sub: user._id,
      department: user.department,
      role: user.role,
      employeeId: user.employeeId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { signToken };
