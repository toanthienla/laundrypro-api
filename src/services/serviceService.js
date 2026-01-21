import { StatusCodes } from 'http-status-codes';
import { Service } from '~/models/serviceModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
import ApiError from '~/utils/ApiError';

const createService = async (reqBody, imageFile) => {
  const serviceData = { ...reqBody };

  // Upload image to Cloudinary if provided
  if (imageFile) {
    const uploadResult = await CloudinaryProvider.streamUpload(
      imageFile.buffer,
      'laundrypro/services'
    );
    serviceData.image = uploadResult.secure_url;
  }

  const newService = await Service.create(serviceData);
  return newService;
};

const getAllServices = async ({ active, category, search }) => {
  const query = { _destroy: false };

  if (active !== undefined) {
    query.active = active === 'true';
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  const services = await Service.find(query).sort({ category: 1, name: 1 });
  return services;
};

const getCategories = async () => {
  const categories = await Service.getCategories();
  return categories;
};

const getServiceById = async (serviceId) => {
  const service = await Service.findOneById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }
  return service;
};

const updateService = async (serviceId, reqBody, imageFile) => {
  const service = await Service.findOneById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  const updateData = { ...reqBody };

  // Upload new image to Cloudinary if provided
  if (imageFile) {
    const uploadResult = await CloudinaryProvider.streamUpload(
      imageFile.buffer,
      'laundrypro/services'
    );
    updateData.image = uploadResult.secure_url;
  }

  const updatedService = await Service.updateService(serviceId, updateData);
  return updatedService;
};

const deleteService = async (serviceId) => {
  const service = await Service.findOneById(serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  await Service.softDelete(serviceId);
};

export const serviceService = {
  createService,
  getAllServices,
  getCategories,
  getServiceById,
  updateService,
  deleteService
};