import mongoose from 'mongoose';

const INVALID_UPDATE_FIELDS = ['_id', 'orderId', 'createdAt'];

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required']
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required']
    },
    // Snapshot of service info at time of order
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    serviceCategory: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true
    },
    serviceUnit: {
      type: String,
      required: [true, 'Service unit is required'],
      trim: true
    },
    // Quantity and pricing
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    // Additional note for this item
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
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

// Pre-save:  Calculate total price
orderItemSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

// Static methods
orderItemSchema.statics.findByOrderId = function (orderId) {
  return this.find({ orderId, _destroy: false });
};

orderItemSchema.statics.findOneById = function (itemId) {
  return this.findById(itemId).where({ _destroy: false });
};

orderItemSchema.statics.updateItem = async function (itemId, updateData) {
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  // Recalculate total if quantity or unitPrice changed
  if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
    const item = await this.findById(itemId);
    if (item) {
      const quantity = updateData.quantity ?? item.quantity;
      const unitPrice = updateData.unitPrice ?? item.unitPrice;
      updateData.totalPrice = quantity * unitPrice;
    }
  }

  return this.findByIdAndUpdate(
    itemId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ _destroy: false });
};

orderItemSchema.statics.softDelete = function (itemId) {
  return this.findByIdAndUpdate(
    itemId,
    { $set: { _destroy: true } },
    { new: true }
  );
};

orderItemSchema.statics.softDeleteByOrderId = function (orderId) {
  return this.updateMany(
    { orderId },
    { $set: { _destroy: true } }
  );
};

// Calculate order total from all items
orderItemSchema.statics.calculateOrderTotal = async function (orderId) {
  const result = await this.aggregate([
    { $match: { orderId: new mongoose.Types.ObjectId(orderId), _destroy: false } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  return result[0]?.total || 0;
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export { OrderItem };