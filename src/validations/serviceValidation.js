import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createService = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().trim().min(1).max(100)
        .messages({ 'string.empty': 'Service name is required' }),
      category: Joi.string().required().trim().min(1).max(100)
        .messages({ 'string.empty': 'Category is required' }),
      unit: Joi.string().required().trim().min(1).max(50)
        .messages({ 'string.empty': 'Unit is required' }),
      active: Joi.boolean().optional()
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateService = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().trim().min(1).max(100).optional(),
      category: Joi.string().trim().min(1).max(100).optional(),
      unit: Joi.string().trim().min(1).max(50).optional(),
      active: Joi.boolean().optional()
      // Note: image is handled by multer, not in JSON body
    });

    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const serviceValidation = {
  createService,
  updateService
};