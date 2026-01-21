import mongoose from 'mongoose';

const loyaltyPointSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static methods
loyaltyPointSchema.statics.findByCustomerId = function (customerId) {
  return this.findOne({ customerId });
};

loyaltyPointSchema.statics.addPoints = async function (customerId, points) {
  return this.findOneAndUpdate(
    { customerId },
    { $inc: { points: points } },
    { new: true, upsert: true }
  );
};

loyaltyPointSchema.statics.deductPoints = async function (customerId, points) {
  const current = await this.findOne({ customerId });
  if (!current || current.points < points) {
    throw new Error('Insufficient points');
  }
  return this.findOneAndUpdate(
    { customerId },
    { $inc: { points: -points } },
    { new: true }
  );
};

const LoyaltyPoint = mongoose.model('LoyaltyPoint', loyaltyPointSchema);

export { LoyaltyPoint };