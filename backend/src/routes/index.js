const express = require('express');

const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const meetingRoutes = require('./meetingRoutes');
const notificationRoutes = require('./notificationRoutes');
const profileRoutes = require('./profileRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/meetings', meetingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);

module.exports = router;
