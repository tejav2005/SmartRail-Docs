const express = require('express');

const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.patch('/me/password', changePassword);

module.exports = router;
