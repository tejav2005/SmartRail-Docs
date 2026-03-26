const express = require('express');

const { createMeeting, listMeetings, updateMeeting, deleteMeeting } = require('../controllers/meetingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.post('/', createMeeting);
router.get('/', listMeetings);
router.patch('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

module.exports = router;
