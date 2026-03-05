import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators';

const sendContactMessage = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().required().min(3).max(50).trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).optional().allow(null, ''),
    phone: Joi.string().required().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    message: Joi.string().required().min(10).max(1000).trim().strict()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
  }
};

export const contactValidation = {
  sendContactMessage
};
