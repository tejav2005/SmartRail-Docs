const path = require('path');
const fs = require('fs');

const Document = require('../models/Document');
const { createSummary, isUrgentContent } = require('../services/summaryService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

function parseTags(tagsInput) {
  if (!tagsInput) return ['GENERAL'];
  const tags = String(tagsInput)
    .split(',')
    .map((tag) => tag.trim().toUpperCase())
    .filter(Boolean);
  const bad = tags.find((tag) => !['URGENT', 'GENERAL'].includes(tag));
  if (bad) throw new AppError(`Unsupported tag: ${bad}`, 400);
  return [...new Set(tags)];
}

/** POST /api/documents/upload */
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('A file is required', 400);

  const title = req.body.title || req.file.originalname;
  const description = req.body.description || '';

  const tags = req.body.tags
    ? parseTags(req.body.tags)
    : (isUrgentContent(title, description) ? ['URGENT'] : ['GENERAL']);

  const document = await Document.create({
    title,
    description,
    category: req.body.category || 'general',
    tags,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size || 0,
    filePath: req.file.path,
    uploadedBy: req.user._id,
    accessRoles: req.body.accessRoles
      ? req.body.accessRoles.split(',').map((role) => role.trim()).filter(Boolean)
      : ['staff', 'admin'],
  });

  const summary = await createSummary({
    title: document.title,
    description: document.description,
    originalName: document.originalName,
    mimeType: document.mimeType,
    filePath: document.filePath,
  });

  document.summary = summary;
  document.summaryStatus = 'completed';
  document.lastSummarizedAt = new Date();
  await document.save();

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: document,
  });
});

/** GET /api/documents */
const listDocuments = asyncHandler(async (req, res) => {
  const { category, tag, search, summaryStatus, uploadedBy, page = 1, limit = 20 } = req.query;
  const query = {};

  if (category) query.category = category;
  if (tag) query.tags = { $in: parseTags(tag) };
  if (summaryStatus) query.summaryStatus = summaryStatus;
  if (uploadedBy) query.uploadedBy = uploadedBy;
  if (search) query.$text = { $search: search };
  if (req.user.role !== 'admin') query.accessRoles = req.user.role;

  const skip = (Number(page) - 1) * Number(limit);

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('uploadedBy', 'name employeeId role')
      .sort(search ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Document.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: documents,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/** GET /api/documents/stats */
const getStats = asyncHandler(async (req, res) => {
  const roleFilter = req.user.role === 'admin' ? {} : { accessRoles: req.user.role };
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalDocs, urgentDocs, recentUploads, recentCount] = await Promise.all([
    Document.countDocuments(roleFilter),
    Document.countDocuments({ ...roleFilter, tags: 'URGENT' }),
    Document.find(roleFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'name employeeId'),
    Document.countDocuments({ ...roleFilter, createdAt: { $gte: oneDayAgo } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalDocs,
      urgentDocs,
      unreadDocs: recentCount,
      recentUploads,
    },
  });
});

/** GET /api/documents/:id */
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate('uploadedBy', 'name employeeId role');
  if (!document) throw new AppError('Document not found', 404);
  if (req.user.role !== 'admin' && !document.accessRoles.includes(req.user.role)) {
    throw new AppError('You are not allowed to access this document', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      ...document.toObject(),
      fileUrl: `/uploads/${path.basename(document.filePath)}`,
    },
  });
});

/** POST /api/documents/:id/summarize */
const summarizeDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new AppError('Document not found', 404);
  if (req.user.role !== 'admin' && !document.accessRoles.includes(req.user.role)) {
    throw new AppError('You are not allowed to summarize this document', 403);
  }

  const summary = await createSummary({
    title: document.title,
    description: document.description,
    originalName: document.originalName,
    mimeType: document.mimeType,
    filePath: document.filePath,
  });

  document.summary = summary;
  document.summaryStatus = 'completed';
  document.lastSummarizedAt = new Date();
  await document.save();

  res.status(200).json({
    success: true,
    message: 'Document summarized successfully',
    data: document,
  });
});

/** PATCH /api/documents/:id */
const updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new AppError('Document not found', 404);
  if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user._id.toString()) {
    throw new AppError('Only the uploader or an admin can update this document', 403);
  }

  ['title', 'description', 'category'].forEach((field) => {
    if (req.body[field] !== undefined) document[field] = req.body[field];
  });

  if (req.body.tags) document.tags = parseTags(req.body.tags);
  if (req.body.accessRoles && req.user.role === 'admin') {
    document.accessRoles = req.body.accessRoles.split(',').map((role) => role.trim()).filter(Boolean);
  }

  await document.save();
  res.status(200).json({ success: true, message: 'Document updated successfully', data: document });
});

/** DELETE /api/documents/:id */
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw new AppError('Document not found', 404);

  const isAdmin = req.user.role === 'admin';
  const isUploader = document.uploadedBy.toString() === req.user._id.toString();
  const hasAccessRole = Array.isArray(document.accessRoles) && document.accessRoles.includes(req.user.role);

  if (!isAdmin && !isUploader && !hasAccessRole) {
    throw new AppError('You are not allowed to delete this document', 403);
  }

  try {
    if (fs.existsSync(document.filePath)) fs.unlinkSync(document.filePath);
  } catch {
    // Non-fatal: file may already be gone
  }

  await document.deleteOne();
  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

module.exports = {
  uploadDocument,
  listDocuments,
  getStats,
  getDocumentById,
  summarizeDocument,
  updateDocument,
  deleteDocument,
};
