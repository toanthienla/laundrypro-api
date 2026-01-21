import mongoose from 'mongoose';

const ORDER_STATUS = {
  PENDING: 'pending',           // Chờ xác nhận
  CONFIRMED: 'confirmed',       // Đã xác nhận
  PROCESSING: 'processing',     // Đang xử lý
  READY: 'ready',               // Sẵn sàng giao
  DELIVERING: 'delivering',     // Đang giao
  COMPLETED: 'completed',       // Hoàn thành
  CANCELLED: 'cancelled'        // Đã hủy
};

const INVALID_UPDATE_FIELDS = ['_id', 'customerId', 'createdAt'];

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Time slot for pickup/delivery
    timeSlotFrom: {
      type: Date,
      default: null
    },
    timeSlotTo: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    // Processing times
    startedAt: {
      type: Date,
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    },
    actualDurationMinutes: {
      type: Number,
      default: null
    },
    // Pricing
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Total price cannot be negative']
    },
    // Additional info
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: null
    },
    // Delivery address (can be different from profile)
    deliveryAddress: {
      type: String,
      trim: true,
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
orderSchema.statics.findByCustomerId = function (customerId, options = {}) {
  const query = { customerId, _destroy: false };
  if (options.status) query.status = options.status;

  return this.find(query).sort({ createdAt: -1 });
};

orderSchema.statics.findByStaffId = function (staffId, options = {}) {
  const query = { staffId, _destroy: false };
  if (options.status) query.status = options.status;

  return this.find(query).sort({ createdAt: -1 });
};

orderSchema.statics.findOneById = function (orderId) {
  return this.findById(orderId).where({ _destroy: false });
};

orderSchema.statics.updateOrder = async function (orderId, updateData) {
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  return this.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ _destroy: false });
};

orderSchema.statics.softDelete = function (orderId) {
  return this.findByIdAndUpdate(
    orderId,
    { $set: { _destroy: true } },
    { new: true }
  );
};

const Order = mongoose.model('Order', orderSchema);

export { Order, ORDER_STATUS };