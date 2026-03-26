const express = require('express');
const { listUsers, getUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', listUsers);
router.get('/:id', getUser);

module.exports = router;
