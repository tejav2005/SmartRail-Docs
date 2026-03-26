const Notification = require('../models/Notification');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

/** GET /api/notifications */
const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: notifications });
});

/** POST /api/notifications (admin only, broadcast) */
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, userId, role } = req.body;
  if (!title || !message) throw new AppError('Title and message are required', 400);

  let targetUsers = [];
  if (userId) {
    targetUsers = await User.find({ _id: userId }).select('_id');
  } else if (role) {
    targetUsers = await User.find({ role }).select('_id');
  } else {
    throw new AppError('Provide either userId or role to target notifications', 400);
  }

  const created = await Notification.insertMany(
    targetUsers.map((user) => ({
      user: user._id,
      title,
      message,
      type: type || 'system',
    }))
  );

  res.status(201).json({ success: true, message: 'Notifications sent successfully', data: created });
});

/** PATCH /api/notifications/:id/read */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw new AppError('Notification not found', 404);

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
});

/** PATCH /api/notifications/mark-all-read */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

/** DELETE /api/notifications/:id */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw new AppError('Notification not found', 404);

  await notification.deleteOne();
  res.status(200).json({ success: true, message: 'Notification dismissed' });
});

module.exports = {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllRead,
  deleteNotification,
};
