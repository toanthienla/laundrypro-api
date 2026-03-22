import { Contact } from '~/models/contactModel';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createContact = async (contactData) => {
  return await Contact.create(contactData);
};

const getAllContacts = async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contacts, total] = await Promise.all([
    Contact.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Contact.countDocuments()
  ]);

  return {
    contacts,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
    stats: { total }
  };
};

const updateContactStatus = async (contactId, status) => {
  const contact = await Contact.findByIdAndUpdate(
    contactId,
    { status },
    { new: true, runValidators: true }
  );
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact not found.');
  }
  return contact;
};

export const contactService = {
  createContact,
  getAllContacts,
  updateContactStatus
};
