const mongoose = require('mongoose');

const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

function normalizeAttendees(attendees) {
  if (!Array.isArray(attendees)) {
    return [];
  }

  return [...new Set(
    attendees
      .filter(Boolean)
      .map((attendee) => String(attendee))
      .filter((attendeeId) => mongoose.Types.ObjectId.isValid(attendeeId))
  )];
}

async function purgeExpiredMeetings() {
  const now = new Date();
  await Meeting.deleteMany({ endTime: { $lt: now } });
}

/** POST /api/meetings */
const createMeeting = asyncHandler(async (req, res) => {
  const { title, agenda, description, startTime, endTime, attendees, mode, location } = req.body;

  if (!title || !startTime || !endTime) {
    throw new AppError('Title, start time, and end time are required', 400);
  }

  const normalizedAttendees = normalizeAttendees(attendees);
  const validAttendees = normalizedAttendees.length > 0
    ? await User.find({ _id: { $in: normalizedAttendees } }).select('_id').lean()
    : [];
  const validAttendeeIds = validAttendees.map((user) => user._id);

  const meeting = await Meeting.create({
    title,
    agenda: agenda || '',
    description: description || '',
    startTime,
    endTime,
    attendees: validAttendeeIds,
    mode: mode || 'in-person',
    location: location || '',
    createdBy: req.user._id,
  });

  if (validAttendeeIds.length > 0) {
    try {
      await Notification.insertMany(
        validAttendeeIds.map((userId) => ({
          user: userId,
          title: 'New meeting scheduled',
          message: `${meeting.title} has been scheduled for ${new Date(meeting.startTime).toLocaleString()}`,
          type: 'meeting',
          metadata: { meetingId: meeting._id.toString() },
        }))
      );
    } catch (error) {
      console.error('Failed to create meeting notifications:', error);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Meeting scheduled successfully',
    data: meeting,
  });
});

/** GET /api/meetings */
const listMeetings = asyncHandler(async (req, res) => {
  await purgeExpiredMeetings();

  const query =
    req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { attendees: req.user._id }] };

  const meetings = await Meeting.find(query)
    .populate('createdBy', 'name employeeId')
    .populate('attendees', 'name employeeId')
    .sort({ startTime: 1 });

  res.status(200).json({ success: true, data: meetings });
});

/** PATCH /api/meetings/:id */
const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw new AppError('Meeting not found', 404);

  if (req.user.role !== 'admin' && meeting.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('Only the organizer or an admin can update this meeting', 403);
  }

  const fields = ['title', 'agenda', 'description', 'startTime', 'endTime', 'mode', 'location', 'status'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      meeting[field] = req.body[field];
    }
  });

  if (req.body.attendees !== undefined) {
    const normalizedAttendees = normalizeAttendees(req.body.attendees);
    const validAttendees = normalizedAttendees.length > 0
      ? await User.find({ _id: { $in: normalizedAttendees } }).select('_id').lean()
      : [];
    meeting.attendees = validAttendees.map((user) => user._id);
  }

  await meeting.save();
  res.status(200).json({ success: true, message: 'Meeting updated successfully', data: meeting });
});

/** DELETE /api/meetings/:id */
const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) throw new AppError('Meeting not found', 404);

  if (req.user.role !== 'admin' && meeting.createdBy.toString() !== req.user._id.toString()) {
    throw new AppError('Only the organizer or an admin can delete this meeting', 403);
  }

  await meeting.deleteOne();
  res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
});

module.exports = { createMeeting, listMeetings, updateMeeting, deleteMeeting };
