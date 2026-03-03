import { Contact } from '~/models/contactModel';

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
    pagination: { page: parseInt(page), limit: parseInt(limit), total }
  };
};

export const contactService = {
  createContact,
  getAllContacts
};