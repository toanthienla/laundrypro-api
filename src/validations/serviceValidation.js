import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const createService = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    category: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Category must be at least 2 characters',
        'string.max': 'Category cannot exceed 100 characters',
        'any.required': 'Category is required'
      }),
    price: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
      }),
    unit: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Unit must be at least 1 character',
        'string.max': 'Unit cannot exceed 50 characters',
        'any.required': 'Unit is required'
      }),
    active: Joi.boolean()
      .messages({
        'boolean.base': 'Active must be true or false'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const updateService = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters'
      }),
    category: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Category must be at least 2 characters',
        'string.max': 'Category cannot exceed 100 characters'
      }),
    price: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Price cannot be negative'
      }),
    unit: Joi.string()
      .min(1)
      .max(50)
      .messages({
        'string.min': 'Unit must be at least 1 character',
        'string.max': 'Unit cannot exceed 50 characters'
      }),
    active: Joi.boolean()
      .messages({
        'boolean.base': 'Active must be true or false'
      })
  });

  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const validateId = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(OBJECT_ID_RULE)
      .required()
      .messages({
        'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
        'any.required': 'ID is required'
      })
  });

  try {
    await schema.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const serviceValidation = {
  createService,
  updateService,
  validateId
};