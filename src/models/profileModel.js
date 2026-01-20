import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      trim: true,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: null
    },
    avatar: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Static methods
profileSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

profileSchema.statics.createOrUpdate = async function (userId, updateData) {
  return this.findOneAndUpdate(
    { userId },
    { $set: { ...updateData, userId } },
    { new: true, upsert: true, runValidators: true }
  );
};

const Profile = mongoose.model('Profile', profileSchema);

export { Profile };