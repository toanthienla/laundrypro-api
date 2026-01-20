import mongoose from 'mongoose';
import { EMAIL_RULE, PASSWORD_RULE } from '~/utils/validators';

const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
};

const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended'
};

const INVALID_UPDATE_FIELDS = ['_id', 'email', 'createdAt'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_RULE, 'Please provide a valid email']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING
    },
    verifyToken: {
      type: String,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    },
    _destroy: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Auto createdAt & updatedAt
    versionKey: false
  }
);

// Static methods
userSchema.statics.findOneByEmail = function (email) {
  return this.findOne({ email, _destroy: false }).select('+passwordHash');
};

userSchema.statics.findOneById = function (userId) {
  return this.findById(userId).where({ _destroy: false });
};

userSchema.statics.findOneByIdWithPassword = function (userId) {
  return this.findById(userId).where({ _destroy: false }).select('+passwordHash');
};

userSchema.statics.updateUser = async function (userId, updateData) {
  // Filter invalid fields
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  return this.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ _destroy: false });
};

const User = mongoose.model('User', userSchema);

export { User, USER_ROLES, USER_STATUS };