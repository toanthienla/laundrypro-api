import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { formatPhoneE164 } from '~/utils/formatters';

const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
};

const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended'
};

const INVALID_UPDATE_FIELDS = ['_id', 'phone', 'firebaseUid', 'role', 'passwordHash', 'createdAt'];

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+[1-9]\d{6,14}$/.test(v);
        },
        message: 'Phone must be in E.164 format (e.g., +84901234567)'
      }
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },
    passwordHash: {
      type: String,
      select: false,
      default: null
    },
    hasPassword: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER
    },
    address: {
      type: String,
      trim: true,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    },
    lastLogin: {
      type: Date,
      default: null
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Pre-save: Format phone to E.164
userSchema.pre('save', function (next) {
  if (this.isModified('phone')) {
    this.phone = formatPhoneE164(this.phone);
  }
  next();
});

// ==================== STATIC METHODS ====================

userSchema.statics.findByPhone = function (phone) {
  const formattedPhone = formatPhoneE164(phone);
  return this.findOne({ phone: formattedPhone });
};

userSchema.statics.findByPhoneWithPassword = function (phone) {
  const formattedPhone = formatPhoneE164(phone);
  return this.findOne({ phone: formattedPhone }).select('+passwordHash');
};

userSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid });
};

userSchema.statics.findOneById = function (userId) {
  return this.findById(userId);
};

userSchema.statics.findOneByIdWithPassword = function (userId) {
  return this.findById(userId).select('+passwordHash');
};

/**
 * Find existing user by Firebase data (NO CREATE)
 * Customer must exist (created by staff) before they can login
 */
userSchema.statics.findByFirebaseAndLink = async function (firebaseData) {
  const { uid, phone, email } = firebaseData;

  // Firebase returns phone in E.164 format (+84901234567)
  const formattedPhone = formatPhoneE164(phone);

  // Try to find by Firebase UID (already linked)
  let user = await this.findOne({ firebaseUid: uid });

  if (user) {
    user.lastLogin = new Date();
    user.isVerified = true;
    await user.save();
    return user;
  }

  // Try to find by phone (customer created by staff)
  user = await this.findOne({ phone: formattedPhone });

  if (!user) {
    // Customer not found - must be created by staff first
    return null;
  }

  // Link Firebase UID to existing user
  user.firebaseUid = uid;
  user.isVerified = true;
  user.lastLogin = new Date();
  if (email && !user.email) user.email = email;
  await user.save();

  return user;
};

/**
 * Find or create customer (for staff creating orders)
 * ONLY staff can create customer accounts
 */
userSchema.statics.findOrCreateCustomer = async function (phone, name, address = null) {
  const formattedPhone = formatPhoneE164(phone);

  let user = await this.findOne({ phone: formattedPhone });

  if (user) {
    let needUpdate = false;
    if (name && name !== user.name) {
      user.name = name;
      needUpdate = true;
    }
    if (address && address !== user.address) {
      user.address = address;
      needUpdate = true;
    }
    if (needUpdate) {
      await user.save();
    }
  } else {
    // Create new customer (only by staff)
    user = await this.create({
      phone: formattedPhone,
      name,
      address,
      role: USER_ROLES.CUSTOMER,
      isVerified: false
    });
  }

  return user;
};

userSchema.statics.updateUser = async function (userId, updateData) {
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  return this.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

userSchema.statics.deleteUser = function (userId) {
  return this.findByIdAndDelete(userId);
};

// ==================== INSTANCE METHODS ====================

userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
  this.hasPassword = true;
  await this.save();
};

userSchema.methods.verifyPassword = async function (password) {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.removePassword = async function () {
  this.passwordHash = null;
  this.hasPassword = false;
  await this.save();
};

// ==================== VIRTUALS ====================

// Get phone in local format (0901234567)
userSchema.virtual('phoneLocal').get(function () {
  if (this.phone && this.phone.startsWith('+84')) {
    return '0' + this.phone.slice(3);
  }
  return this.phone;
});

const User = mongoose.model('User', userSchema);

export { User, USER_ROLES, USER_STATUS };