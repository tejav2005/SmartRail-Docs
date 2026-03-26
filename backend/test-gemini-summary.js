const path = require('path');
const connectDatabase = require('./src/config/db');
const mongoose = require('mongoose');

const User = require('./src/models/User');
const Document = require('./src/models/Document');
const { createSummary } = require('./src/services/summaryService');

async function main() {
  await connectDatabase();

  const user = await User.findOne().select('_id name employeeId role');
  if (!user) {
    console.log(JSON.stringify({ ok: false, reason: 'No users found in database' }, null, 2));
    return;
  }

  const filePath = path.join(__dirname, 'uploads', '1774516363179-kmrl_sample_document.pdf');
  const payload = {
    title: 'Test Metro Operations Memo',
    description: 'Platform crowd management and signal maintenance advisory.',
    originalName: 'kmrl_sample_document.pdf',
    mimeType: 'application/pdf',
    filePath,
  };

  const summary = await createSummary(payload);
  const doc = await Document.create({
    title: payload.title,
    description: payload.description,
    category: 'general',
    tags: ['GENERAL'],
    fileName: path.basename(filePath),
    originalName: payload.originalName,
    mimeType: payload.mimeType,
    size: 0,
    filePath: payload.filePath,
    uploadedBy: user._id,
    accessRoles: ['staff', 'admin'],
    summary,
    summaryStatus: 'completed',
    lastSummarizedAt: new Date(),
  });

  const saved = await Document.findById(doc._id).select('summary summaryStatus lastSummarizedAt title');
  console.log(JSON.stringify({
    ok: true,
    user: { id: String(user._id), name: user.name, employeeId: user.employeeId },
    summaryPreview: saved.summary.slice(0, 300),
    summaryStatus: saved.summaryStatus,
    hasSummary: Boolean(saved.summary && saved.summary.trim()),
    documentId: String(saved._id),
  }, null, 2));

  await Document.deleteOne({ _id: doc._id });
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.connection.close();
    } catch {}
  });
