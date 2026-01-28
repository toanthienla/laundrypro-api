import mongoose from 'mongoose';

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [50, 'Unit cannot exceed 50 characters']
    },
    image: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ active: 1 });
serviceSchema.index({ price: 1 });

// ==================== STATIC METHODS ====================

serviceSchema.statics.findOneById = function (serviceId) {
  return this.findById(serviceId);
};

serviceSchema.statics.findAllActive = function () {
  return this.find({ active: true }).sort({ category: 1, name: 1 });
};

serviceSchema.statics.findByCategory = function (category) {
  return this.find({ category, active: true }).sort({ name: 1 });
};

serviceSchema.statics.getCategories = async function () {
  const categories = await this.distinct('category', { active: true });
  return categories.sort();
};

serviceSchema.statics.updateService = async function (serviceId, updateData) {
  Object.keys(updateData).forEach((field) => {
    if (INVALID_UPDATE_FIELDS.includes(field)) {
      delete updateData[field];
    }
  });

  return this.findByIdAndUpdate(
    serviceId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

serviceSchema.statics.deleteService = function (serviceId) {
  return this.findByIdAndDelete(serviceId);
};

const Service = mongoose.model('Service', serviceSchema);

export { Service };