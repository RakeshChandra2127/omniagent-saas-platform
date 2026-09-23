import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  tenantId: Types.ObjectId;
  agentConfigId: Types.ObjectId;
  contactId: Types.ObjectId;
  channel: 'web' | 'whatsapp' | 'telegram';
  status: 'active' | 'waiting' | 'resolved' | 'handed_off' | 'expired';
  assignedTo?: Types.ObjectId;
  metadata?: any;
  tags: string[];
  lastMessageAt?: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    agentConfigId: { type: Schema.Types.ObjectId, ref: 'AgentConfig', required: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    channel: { type: String, enum: ['web', 'whatsapp', 'telegram'], required: true },
    status: { type: String, enum: ['active', 'waiting', 'resolved', 'handed_off', 'expired'], default: 'active' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
    tags: [{ type: String }],
    lastMessageAt: { type: Date },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ tenantId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ tenantId: 1, contactId: 1 });
conversationSchema.index({ tenantId: 1, agentConfigId: 1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
