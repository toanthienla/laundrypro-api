import mongoose from 'mongoose';

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const PAYMENT_METHOD = {
  CASH: 'cash',
  MOMO: 'momo',
  VNPAY: 'vnpay',
  BANK: 'bank'
};

const INVALID_UPDATE_FIELDS = ['_id', 'orderId', 'createdAt'];

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true
    },
    method: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_METHOD),
        message: 'Payment method `{VALUE}` is not supported'
      },
      required: [true, 'Payment method is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    transactionRef: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static methods
paymentSchema.statics.findByOrderId = function (orderId, options = {}) {
  const query = { orderId };
  if (options.status) query.status = options.status;
  return this.find(query).sort({ createdAt: -1 });
};

paymentSchema.statics.findOneById = function (paymentId) {
  return this.findById(paymentId);
};

paymentSchema.statics.findByTransactionRef = function (transactionRef) {
  return this.findOne({ transactionRef });
};

paymentSchema.statics.createPayment = function (paymentData) {
  return this.create(paymentData);
};

paymentSchema.statics.updatePayment = async function (paymentId, updateData) {
  // Prevent updating protected fields
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  return this.findByIdAndUpdate(
    paymentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

paymentSchema.statics.updateStatus = function (paymentId, status, transactionRef = null) {
  const updateData = { status };

  if (status === PAYMENT_STATUS.PAID && !this.paidAt) {
    updateData.paidAt = new Date();
  }

  if (status === PAYMENT_STATUS.PENDING || status === PAYMENT_STATUS.FAILED) {
    updateData.paidAt = null;
  }

  if (transactionRef) {
    updateData.transactionRef = transactionRef;
  }

  return this.findByIdAndUpdate(
    paymentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

paymentSchema.statics.deletePayment = function (paymentId) {
  return this.findByIdAndDelete(paymentId);
};

paymentSchema.statics.getTotalPaidByOrderId = async function (orderId) {
  const result = await this.aggregate([
    {
      $match: {
        orderId: new mongoose.Types.ObjectId(orderId),
        status: PAYMENT_STATUS.PAID
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalPaid : 0;
};

paymentSchema.statics.getPaymentStats = async function (query = {}) {
  const { startDate, endDate, method } = query;
  const matchFilter = {};

  if (startDate || endDate) {
    matchFilter.createdAt = {};
    if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
    if (endDate) matchFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  if (method) matchFilter.method = method;

  // Stats by status
  const byStatus = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Stats by method
  const byMethod = await this.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Total successful payments
  const successfulFilter = { ...matchFilter, status: PAYMENT_STATUS.PAID };
  const successfulResult = await this.aggregate([
    { $match: successfulFilter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    byStatus,
    byMethod,
    successful: successfulResult.length > 0 ? successfulResult[0] : { totalAmount: 0, count: 0 }
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

export { Payment, PAYMENT_STATUS, PAYMENT_METHOD };