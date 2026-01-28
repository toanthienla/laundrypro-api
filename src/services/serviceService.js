import { StatusCodes } from 'http-status-codes';
import { Service } from '~/models/serviceModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
import ApiError from '~/utils/ApiError';

const createService = async (reqBody, imageFile) => {
  const { name, category, price, unit, active } = reqBody;

  const serviceData = {
    name,
    category,
    price: parseFloat(price),
    unit,
    active: active !== undefined ? active : true
  };

  if (imageFile) {
    const uploaded = await CloudinaryProvider.streamUpload(imageFile.buffer, 'services');
    serviceData.image = uploaded.secure_url;
  }

  const service = await Service.create(serviceData);
  return service;
};

const getAllServices = async (query = {}) => {
  const { active, category, search, minPrice, maxPrice } = query;
  const filter = {};

  if (active !== undefined) {
    filter.active = active === 'true';
  }

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
  }

  const services = await Service.find(filter).sort({ category: 1, name: 1 });
  return services;
};

const getServiceById = async (serviceId) => {
  const service = await Service.findOneById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  return service;
};

const getCategories = async () => {
  const categories = await Service.getCategories();
  return categories;
};

const updateService = async (serviceId, reqBody, imageFile) => {
  const service = await Service.findOneById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  const updateData = {};

  if (reqBody.name) updateData.name = reqBody.name;
  if (reqBody.category) updateData.category = reqBody.category;
  if (reqBody.price !== undefined) updateData.price = parseFloat(reqBody.price);
  if (reqBody.unit) updateData.unit = reqBody.unit;
  if (reqBody.active !== undefined) updateData.active = reqBody.active;

  if (imageFile) {
    const uploaded = await CloudinaryProvider.streamUpload(imageFile.buffer, 'services');
    updateData.image = uploaded.secure_url;
  }

  const updatedService = await Service.updateService(serviceId, updateData);
  return updatedService;
};

const deleteService = async (serviceId) => {
  const service = await Service.findOneById(serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  await Service.deleteService(serviceId);
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceById,
  getCategories,
  updateService,
  deleteService
};