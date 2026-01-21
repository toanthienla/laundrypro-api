import mongoose from 'mongoose';

const NOTIFICATION_TYPES = {
  ORDER_STATUS: 'order_status',
  PAYMENT: 'payment',
  PROMOTION: 'promotion',
  SYSTEM: 'system'
};

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.SYSTEM
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    read: {
      type: Boolean,
      default: false
    },
    // Reference to related entity
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    referenceType: {
      type: String,
      enum: ['Order', 'Payment', null],
      default: null
    },
    _destroy: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static methods
notificationSchema.statics.findByUserId = function (userId, options = {}) {
  const query = { userId, _destroy: false };
  if (options.unreadOnly) query.read = false;

  return this.find(query).sort({ createdAt: -1 }).limit(options.limit || 50);
};

notificationSchema.statics.countUnread = function (userId) {
  return this.countDocuments({ userId, read: false, _destroy: false });
};

notificationSchema.statics.markAsRead = function (notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { $set: { read: true } },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { userId, read: false, _destroy: false },
    { $set: { read: true } }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

export { Notification, NOTIFICATION_TYPES };