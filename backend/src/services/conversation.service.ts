import { AppError } from '../utils/app-error';
import { Conversation } from '../models/conversation.model';

export class ConversationService {
  async create(tenantId: string, data: any) {
    return await Conversation.create({ ...data, tenantId });
  }

  async findAll(tenantId: string, filters: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };
    
    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('contactId')
        .populate('lastMessageId')
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      Conversation.countDocuments(query)
    ]);
    
    return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const conversation = await Conversation.findOne({ _id: id, tenantId })
      .populate('contactId')
      .populate('lastMessageId');
      
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    return conversation;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status } },
      { new: true }
    );
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    return conversation;
  }

  async getOrCreateForContact(tenantId: string, contactId: string, agentConfigId: string, channel: string) {
    let conversation = await Conversation.findOne({
      tenantId,
      contactId,
      status: 'active'
    });

    if (!conversation) {
      conversation = await Conversation.create({
        tenantId,
        contactId,
        agentConfigId,
        channel,
        status: 'active',
        messageCount: 0
      });
    }

    return conversation;
  }
}

export const conversationService = new ConversationService();
