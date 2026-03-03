import { StatusCodes } from 'http-status-codes';
import { contactService } from '~/services/contactService';

const sendContactMessage = async (req, res, next) => {
  try {
    const result = await contactService.createContact(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Message saved.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const result = await contactService.getAllContacts(req.query);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const contactController = {
  sendContactMessage,
  getAllContacts
};