const express = require('express');

const {
  listNotifications,
  createNotification,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', listNotifications);
router.post('/', authorize('admin'), createNotification);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

module.exports = router;
