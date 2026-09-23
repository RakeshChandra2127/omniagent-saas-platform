import { AppError } from '../utils/app-error';
import { Lead } from '../models/lead.model';

export class LeadService {
  async create(tenantId: string, data: any) {
    return await Lead.create({ ...data, tenantId });
  }

  async findAll(tenantId: string, filters: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };
    
    const [leads, total] = await Promise.all([
      Lead.find(query).populate('contactId').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Lead.countDocuments(query)
    ]);
    
    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const lead = await Lead.findOne({ _id: id, tenantId })
      .populate('contactId')
      .populate('conversationId');
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    return lead;
  }

  async update(tenantId: string, id: string, data: any) {
    const lead = await Lead.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: data },
      { new: true }
    );
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    return lead;
  }

  async addNote(tenantId: string, id: string, note: any) {
    const lead = await Lead.findOneAndUpdate(
      { _id: id, tenantId },
      { $push: { notes: note } },
      { new: true }
    );
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }
    return lead;
  }
}

export const leadService = new LeadService();
