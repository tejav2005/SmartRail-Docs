#!/usr/bin/env node
/**
 * KMRL Admin Seed Script
 *
 * Usage (run from the project root):
 *   node backend/scripts/seedAdmin.js
 *
 * Optional env overrides:
 *   MONGODB_URI=... ADMIN_EMPLOYEE_ID=... ADMIN_NAME=... ADMIN_PASSWORD=... node backend/scripts/seedAdmin.js
 *
 * If the employee ID already exists it will be SKIPPED (idempotent).
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kmrl-app';

// Default admin credentials (override via env vars for production)
const ADMIN_NAME = process.env.ADMIN_NAME || 'KMRL Administrator';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kmrl.in';
const ADMIN_EMPLOYEE_ID = process.env.ADMIN_EMPLOYEE_ID || 'KM-ADMIN-001';
const ADMIN_DEPARTMENT = process.env.ADMIN_DEPARTMENT || 'Administration';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    employeeId: String,
    password: String,
    phone: String,
    department: String,
    avatarUrl: String,
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    settings: {
      notificationsEnabled: { type: Boolean, default: true },
      darkModeEnabled: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
    },
  },
  { timestamps: true }
);

async function seed() {
  console.log('\n🌱  KMRL Admin Seed Script');
  console.log('─'.repeat(40));

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅  Connected to MongoDB: ${MONGODB_URI}`);

    const User = mongoose.model('User', userSchema);

    // Check if admin already exists
    const existing = await User.findOne({ employeeId: ADMIN_EMPLOYEE_ID.toUpperCase() });
    if (existing) {
      console.log(`ℹ️   Admin "${ADMIN_EMPLOYEE_ID}" already exists — skipping.`);
      await mongoose.disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      employeeId: ADMIN_EMPLOYEE_ID.toUpperCase(),
      department: ADMIN_DEPARTMENT,
      password: passwordHash,
      role: 'admin',
      settings: { notificationsEnabled: true, darkModeEnabled: false, language: 'en' },
    });

    console.log('\n✅  Admin user created successfully!');
    console.log('─'.repeat(40));
    console.log(`   Name       : ${admin.name}`);
    console.log(`   Employee ID: ${admin.employeeId}`);
    console.log(`   Email      : ${admin.email}`);
    console.log(`   Password   : ${ADMIN_PASSWORD}  (change this after first login!)`);
    console.log(`   Role       : ${admin.role}`);
    console.log('─'.repeat(40));
    console.log('\n⚠️   IMPORTANT: Change the default password after first login!\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB.\n');
  }
}

seed();
