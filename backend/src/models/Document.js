const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general' },
    tags: [
      {
        type: String,
        enum: ['URGENT', 'GENERAL'],
      },
    ],
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    filePath: { type: String, required: true },
    summary: { type: String, default: '' },
    summaryStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    lastSummarizedAt: { type: Date, default: null },
    accessRoles: {
      type: [String],
      enum: ['admin', 'staff'],
      default: ['staff', 'admin'],
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

documentSchema.index({ title: 'text', description: 'text', originalName: 'text' });
documentSchema.index({ category: 1, tags: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
