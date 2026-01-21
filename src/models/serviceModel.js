import mongoose from 'mongoose';

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
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
serviceSchema.statics.findAllActive = function () {
  return this.find({ active: true, _destroy: false }).sort({ category: 1, name: 1 });
};

serviceSchema.statics.findAll = function (query = {}) {
  return this.find({ ...query, _destroy: false }).sort({ category: 1, name: 1 });
};

serviceSchema.statics.findOneById = function (serviceId) {
  return this.findById(serviceId).where({ _destroy: false });
};

serviceSchema.statics.findByCategory = function (category) {
  return this.find({
    category: { $regex: category, $options: 'i' },
    active: true,
    _destroy: false
  }).sort({ name: 1 });
};

serviceSchema.statics.getCategories = async function () {
  return this.distinct('category', { active: true, _destroy: false });
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
  ).where({ _destroy: false });
};

serviceSchema.statics.softDelete = function (serviceId) {
  return this.findByIdAndUpdate(
    serviceId,
    { $set: { _destroy: true, active: false } },
    { new: true }
  );
};

const Service = mongoose.model('Service', serviceSchema);

export { Service };