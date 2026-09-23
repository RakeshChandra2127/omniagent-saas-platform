import { AppError } from '../utils/app-error';
import { Contact } from '../models/contact.model';

export class ContactService {
  async create(tenantId: string, data: any) {
    return await Contact.create({ ...data, tenantId });
  }

  async findAll(tenantId: string, filters: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };
    
    const [contacts, total] = await Promise.all([
      Contact.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Contact.countDocuments(query)
    ]);
    
    return { contacts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const contact = await Contact.findOne({ _id: id, tenantId });
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }
    return contact;
  }

  async update(tenantId: string, id: string, data: any) {
    const contact = await Contact.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: data },
      { new: true }
    );
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }
    return contact;
  }

  async findOrCreateByPhone(tenantId: string, phone: string, displayName?: string) {
    let contact = await Contact.findOne({ tenantId, phone });
    if (!contact) {
      contact = await Contact.create({
        tenantId,
        phone,
        displayName: displayName || phone,
        status: 'active'
      });
    }
    return contact;
  }
}

export const contactService = new ContactService();
