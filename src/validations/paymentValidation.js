import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const createPayment = async (req, res, next) => {
  const condition = Joi.object({
    orderId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    amount: Joi.number().min(0).required(),
    method: Joi.string().valid('cash', 'momo', 'vnpay', 'bank_transfer').required(),
    status: Joi.string().valid('pending', 'success', 'failed', 'refunded').default('pending')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updatePaymentStatus = async (req, res, next) => {
  const condition = Joi.object({
    status: Joi.string().valid('pending', 'success', 'failed', 'refunded').required(),
    transactionRef: Joi.string().optional().allow(null, '')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

const updatePaymentMethod = async (req, res, next) => {
  const condition = Joi.object({
    method: Joi.string().valid('cash', 'momo', 'vnpay', 'bank_transfer').required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

export const paymentValidation = {
  createPayment,
  updatePaymentStatus,
  updatePaymentMethod
};
