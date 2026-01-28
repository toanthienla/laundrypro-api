import mongoose from 'mongoose';

const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
};

const INVALID_UPDATE_FIELDS = ['_id', 'customerId', 'createdBy', 'createdAt'];

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    completedAt: {
      type: Date,
      default: null
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Total price cannot be negative']
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

// Static methods
orderSchema.statics.findByCustomerId = function (customerId, options = {}) {
  const query = { customerId };
  if (options.status) query.status = options.status;
  return this.find(query).sort({ createdAt: -1 });
};

orderSchema.statics.findByCreatedBy = function (createdBy, options = {}) {
  const query = { createdBy };
  if (options.status) query.status = options.status;
  return this.find(query).sort({ createdAt: -1 });
};

orderSchema.statics.findOneById = function (orderId) {
  return this.findById(orderId);
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
  );
};

orderSchema.statics.deleteOrder = function (orderId) {
  return this.findByIdAndDelete(orderId);
};

const Order = mongoose.model('Order', orderSchema);

export { Order, ORDER_STATUS };