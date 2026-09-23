import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  tenantId: Types.ObjectId;
  conversationId: Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  contentType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'interactive';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: any;
  toolCalls?: any[];
  toolResult?: string;
  tokens?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'interactive'], default: 'text' },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
    metadata: { type: Schema.Types.Mixed },
    toolCalls: [{ type: Schema.Types.Mixed }],
    toolResult: { type: String },
    tokens: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
    },
    externalId: { type: String },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ tenantId: 1, createdAt: -1 });
messageSchema.index({ externalId: 1 }, { sparse: true, unique: true });

export const Message = model<IMessage>('Message', messageSchema);
