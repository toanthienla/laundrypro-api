import mongoose from 'mongoose';

const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  VNPAY: 'vnpay',
  ZALOPAY: 'zalopay'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required']
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    transactionId: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    },
    note: {
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
paymentSchema.statics.findByOrderId = function (orderId) {
  return this.findOne({ orderId, _destroy: false });
};

paymentSchema.statics.findByCustomerId = function (customerId) {
  return this.find({ customerId, _destroy: false }).sort({ createdAt: -1 });
};

paymentSchema.statics.findOneById = function (paymentId) {
  return this.findById(paymentId).where({ _destroy: false });
};

paymentSchema.statics.updatePayment = async function (paymentId, updateData) {
  return this.findByIdAndUpdate(
    paymentId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).where({ _destroy: false });
};

const Payment = mongoose.model('Payment', paymentSchema);

export { Payment, PAYMENT_METHODS, PAYMENT_STATUS };