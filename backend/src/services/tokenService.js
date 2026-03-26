const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      employeeId: user.employeeId,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { signToken };
