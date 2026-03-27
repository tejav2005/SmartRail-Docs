const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDatabase = require('./src/config/db');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const { uploadDocument, listDocuments, getStats } = require('./src/controllers/documentController');

function createMockRes(resolve) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      resolve({ statusCode: this.statusCode, payload });
    },
  };
}

function invoke(handler, req) {
  return new Promise((resolve, reject) => {
    const res = createMockRes(resolve);
    handler(
      req,
      res,
      (err) => {
        if (err) reject(err);
      }
    );
  });
}

async function createUser({ name, employeeId, department }) {
  const password = await bcrypt.hash('Password123', 12);
  return User.create({
    name,
    employeeId,
    department,
    password,
    role: 'staff',
  });
}

async function main() {
  await connectDatabase();

  const testStamp = Date.now();
  const sampleFile = path.join(__dirname, 'uploads', '1774531246552-kmrl_urgent_demo.pdf');
  const createdIds = { users: [], documents: [] };

  try {
    const userA = await createUser({
      name: 'Dept Test User A',
      employeeId: `OPS-A-${testStamp}`,
      department: 'Operations',
    });
    const userB = await createUser({
      name: 'Dept Test User B',
      employeeId: `OPS-B-${testStamp}`,
      department: 'Operations',
    });
    const userC = await createUser({
      name: 'Dept Test User C',
      employeeId: `MNT-C-${testStamp}`,
      department: 'Maintenance',
    });

    createdIds.users.push(userA._id, userB._id, userC._id);

    const uploadResult = await invoke(uploadDocument, {
      method: 'POST',
      originalUrl: '/api/documents/upload',
      body: {
        title: `Department Filter Test ${testStamp}`,
        description: 'Uploaded by User A in Operations for department filter verification.',
      },
      file: {
        filename: path.basename(sampleFile),
        originalname: 'kmrl_urgent_demo.pdf',
        mimetype: 'application/pdf',
        size: 0,
        path: sampleFile,
      },
      user: userA,
    });

    const uploadedDocument = uploadResult.payload?.data;
    if (!uploadedDocument?._id) {
      throw new Error('Upload test failed: document was not created');
    }
    createdIds.documents.push(uploadedDocument._id);

    const userBDocuments = await invoke(listDocuments, {
      method: 'GET',
      originalUrl: '/api/documents',
      query: { limit: 50 },
      user: userB,
    });
    const userCDocuments = await invoke(listDocuments, {
      method: 'GET',
      originalUrl: '/api/documents',
      query: { limit: 50 },
      user: userC,
    });

    const userBStats = await invoke(getStats, {
      method: 'GET',
      originalUrl: '/api/documents/stats',
      query: {},
      user: userB,
    });
    const userCStats = await invoke(getStats, {
      method: 'GET',
      originalUrl: '/api/documents/stats',
      query: {},
      user: userC,
    });

    const userBVisible = (userBDocuments.payload?.data || []).some((doc) => String(doc._id) === String(uploadedDocument._id));
    const userCVisible = (userCDocuments.payload?.data || []).some((doc) => String(doc._id) === String(uploadedDocument._id));
    const userBRecentVisible = (userBStats.payload?.data?.recentUploads || []).some((doc) => String(doc._id) === String(uploadedDocument._id));
    const userCRecentVisible = (userCStats.payload?.data?.recentUploads || []).some((doc) => String(doc._id) === String(uploadedDocument._id));

    console.log(JSON.stringify({
      uploadedDocumentId: String(uploadedDocument._id),
      uploadedDepartment: uploadedDocument.department,
      results: {
        userA: { department: userA.department },
        userB: {
          department: userB.department,
          canSeeDocument: userBVisible,
          totalDocs: userBStats.payload?.data?.totalDocs || 0,
          recentUploadsContainsDocument: userBRecentVisible,
        },
        userC: {
          department: userC.department,
          canSeeDocument: userCVisible,
          totalDocs: userCStats.payload?.data?.totalDocs || 0,
          recentUploadsContainsDocument: userCRecentVisible,
        },
      },
      expected: {
        userBCanSee: true,
        userCCannotSee: true,
      },
    }, null, 2));
  } finally {
    if (createdIds.documents.length > 0) {
      await Document.deleteMany({ _id: { $in: createdIds.documents } });
    }
    if (createdIds.users.length > 0) {
      await User.deleteMany({ _id: { $in: createdIds.users } });
    }
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
