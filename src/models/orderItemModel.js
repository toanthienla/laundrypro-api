import mongoose from 'mongoose';

const INVALID_UPDATE_FIELDS = ['_id', 'orderId', 'serviceId', 'createdAt'];

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
    // Snapshots at order time (in case service changes later)
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
    servicePrice: {
      type: Number,
      required: [true, 'Service price is required'],
      min: 0
    },
    serviceUnit: {
      type: String,
      required: [true, 'Service unit is required'],
      trim: true
    },
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
      default: 0
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ serviceId: 1 });

// Pre-save: Calculate totalPrice
orderItemSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

// ==================== STATIC METHODS ====================

orderItemSchema.statics.findByOrderId = function (orderId) {
  return this.find({ orderId }).populate('serviceId', 'name category price unit image');
};

orderItemSchema.statics.findOneById = function (itemId) {
  return this.findById(itemId);
};

orderItemSchema.statics.createItem = async function (itemData) {
  const item = await this.create(itemData);
  return item;
};

orderItemSchema.statics.updateItem = async function (itemId, updateData) {
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  // Recalculate totalPrice if quantity or unitPrice changed
  if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
    const item = await this.findById(itemId);
    if (item) {
      const quantity = updateData.quantity !== undefined ? updateData.quantity : item.quantity;
      const unitPrice = updateData.unitPrice !== undefined ? updateData.unitPrice : item.unitPrice;
      updateData.totalPrice = quantity * unitPrice;
    }
  }

  return this.findByIdAndUpdate(
    itemId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

orderItemSchema.statics.deleteItem = function (itemId) {
  return this.findByIdAndDelete(itemId);
};

orderItemSchema.statics.deleteByOrderId = function (orderId) {
  return this.deleteMany({ orderId });
};

orderItemSchema.statics.calculateOrderTotal = async function (orderId) {
  const result = await this.aggregate([
    { $match: { orderId: new mongoose.Types.ObjectId(orderId) } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export { OrderItem };