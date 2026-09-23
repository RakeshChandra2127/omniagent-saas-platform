import { Message } from '../models/message.model';
import { Conversation } from '../models/conversation.model';

export class MessageService {
  async create(tenantId: string, conversationId: string, data: any) {
    const message = await Message.create({
      ...data,
      tenantId,
      conversationId
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMessageId: message._id, lastMessageAt: message.createdAt },
      $inc: { messageCount: 1 }
    });

    return message;
  }

  async findByConversation(tenantId: string, conversationId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find({ tenantId, conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ tenantId, conversationId })
    ]);

    return { messages, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(messageId: string, status: string) {
    return await Message.findByIdAndUpdate(
      messageId,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );
  }
}

export const messageService = new MessageService();
