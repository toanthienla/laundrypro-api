import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createService = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict(),
    category: Joi.string().required().trim().strict().max(100),
    price: Joi.number().required().min(0),
    unit: Joi.string().required().trim().strict().max(50),
    active: Joi.boolean().optional().default(true)
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
    category: Joi.string().optional().trim().strict().max(100),
    price: Joi.number().optional().min(0),
    unit: Joi.string().optional().trim().strict().max(50),
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
