import { StatusCodes } from 'http-status-codes';
import { serviceService } from '~/services/serviceService';

const createService = async (req, res, next) => {
  try {
    const imageFile = req.file;
    const result = await serviceService.createService(req.body, imageFile);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Service created successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllServices = async (req, res, next) => {
  try {
    const { active, category, search } = req.query;
    const result = await serviceService.getAllServices({ active, category, search });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await serviceService.getServiceById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await serviceService.getCategories();
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const imageFile = req.file;
    const result = await serviceService.updateService(id, req.body, imageFile);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Service updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Service deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const serviceController = {
  createService,
  getAllServices,
  getServiceById,
  getCategories,
  updateService,
  deleteService
};