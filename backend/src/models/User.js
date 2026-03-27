const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    notificationsEnabled: { type: Boolean, default: true },
    darkModeEnabled: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      validate: {
        validator: (value) => typeof value === 'string' && value.trim().length > 0,
        message: 'Department is required',
      },
    },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    settings: { type: userSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    employeeId: this.employeeId,
    phone: this.phone,
    department: this.department,
    avatarUrl: this.avatarUrl,
    role: this.role,
    settings: this.settings,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
