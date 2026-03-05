import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createService = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict(),
    description: Joi.string().required().trim().strict(),
    price: Joi.number().required().min(0),
    category: Joi.string().required().trim().strict(),
    unit: Joi.string().required().trim().strict(),
    active: Joi.boolean().default(true)
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updateService = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().optional().min(3).max(100).trim().strict(),
    description: Joi.string().optional().trim().strict(),
    price: Joi.number().optional().min(0),
    category: Joi.string().optional().trim().strict(),
    unit: Joi.string().optional().trim().strict(),
    active: Joi.boolean().optional()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

export const serviceValidation = {
  createService,
  updateService
};
