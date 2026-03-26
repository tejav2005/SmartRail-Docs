const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toUserListItem(user) {
  return {
    _id: user._id,
    name: user.name || '',
    employeeId: user.employeeId || '',
    email: user.email || '',
    department: user.department || '',
    role: user.role || 'staff',
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
  };
}

/**
 * GET /api/users
 * Returns all users (safe fields only, no passwords).
 * Supports optional ?search= query param to filter by name, employeeId, or department.
 * Restricted: authenticated users only.
 */
const listUsers = asyncHandler(async (req, res) => {
  const { search, department, role } = req.query;

  const filter = {};

  if (department) {
    filter.department = { $regex: escapeRegex(department), $options: 'i' };
  }

  if (role) {
    filter.role = role;
  }

  if (search) {
    const safeSearch = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [
      { name: safeSearch },
      { employeeId: safeSearch },
      { department: safeSearch },
      { email: safeSearch },
    ];
  }

  const users = await User.find(filter)
    .select('_id name employeeId email department role avatarUrl createdAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const safeUsers = users.map(toUserListItem);

  res.status(200).json({
    success: true,
    data: safeUsers,
    count: safeUsers.length,
  });
});

/**
 * GET /api/users/:id
 * Returns a single user's safe profile.
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('_id name employeeId email department role avatarUrl createdAt')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({ success: true, data: toUserListItem(user) });
});

module.exports = { listUsers, getUser };
