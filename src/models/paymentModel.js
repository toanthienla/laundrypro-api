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

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      unique: true,
      index: true
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
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
      sparse: true,
      unique: true
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

// ==================== STATIC METHODS ====================

// Find single payment by order (returns one or null)
paymentSchema.statics.findByOrderId = function (orderId) {
  return this.findOne({ orderId });
};

// Create payment
paymentSchema.statics.createPayment = function (paymentData, session = null) {
  const options = session ? { session } : {};
  return this.create([paymentData], options);
};

// Update payment status and paidAt
paymentSchema.statics.updateStatus = function (paymentId, status, transactionRef = null, session = null) {
  const updateData = { status };

  if (status === PAYMENT_STATUS.PAID) {
    updateData.paidAt = new Date();
  } else if (status === PAYMENT_STATUS.PENDING || status === PAYMENT_STATUS.FAILED) {
    updateData.paidAt = null;
  }

  if (transactionRef) {
    updateData.transactionRef = transactionRef;
  }

  const options = { new: true, runValidators: true };
  if (session) options.session = session;

  return this.findByIdAndUpdate(paymentId, { $set: updateData }, options);
};

// Delete payment by ID
paymentSchema.statics.deletePayment = function (paymentId, session = null) {
  const options = session ? { session } : {};
  return this.findByIdAndDelete(paymentId, options);
};

// Delete payment by Order ID (for cascade delete)
paymentSchema.statics.deleteByOrderId = function (orderId, session = null) {
  const options = session ? { session } : {};
  return this.deleteOne({ orderId }, options);
};

// Get payment stats (for reporting)
paymentSchema.statics.getPaymentStats = async function (query = {}) {
  const { startDate, endDate, method } = query;
  const matchFilter = {};

  if (startDate || endDate) {
    matchFilter.createdAt = {};
    if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
    if (endDate) matchFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  if (method) matchFilter.method = method;

  const [byStatus, byMethod] = await Promise.all([
    this.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]),
    this.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ])
  ]);

  return { byStatus, byMethod };
};

const Payment = mongoose.model('Payment', paymentSchema);

export { Payment, PAYMENT_STATUS, PAYMENT_METHOD };