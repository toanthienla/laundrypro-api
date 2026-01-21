import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      unique: true // One feedback per order
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
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
feedbackSchema.statics.findByOrderId = function (orderId) {
  return this.findOne({ orderId, _destroy: false });
};

feedbackSchema.statics.findByCustomerId = function (customerId) {
  return this.find({ customerId, _destroy: false }).sort({ createdAt: -1 });
};

feedbackSchema.statics.getAverageRating = async function () {
  const result = await this.aggregate([
    { $match: { _destroy: false } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return result[0] || { avgRating: 0, count: 0 };
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export { Feedback };