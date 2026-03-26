const express = require('express');
const multer = require('multer');

const {
  uploadDocument,
  listDocuments,
  getStats,
  getDocumentById,
  summarizeDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');

const router = express.Router();

// Wrap multer so its errors get a proper HTTP status instead of 500
function multerUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    console.error('[multer error]', err.message, err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
  });
}

router.use(authenticate);
router.get('/stats', getStats);
router.post('/upload', multerUpload, uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocumentById);
router.patch('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/summarize', summarizeDocument);

module.exports = router;
