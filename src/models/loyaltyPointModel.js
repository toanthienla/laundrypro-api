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
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const LoyaltyPoint = mongoose.model('LoyaltyPoint', loyaltyPointSchema);

export { LoyaltyPoint };