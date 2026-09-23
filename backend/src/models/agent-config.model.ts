import { Schema, model, Document, Types } from 'mongoose';

export interface IAgentConfig extends Document {
  tenantId: Types.ObjectId;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  channels: ('web' | 'whatsapp' | 'telegram')[];
  llmConfig: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  persona?: {
    name?: string;
    tone?: string;
    role?: string;
  };
  guardrails?: {
    blockedTopics: string[];
    maxConversationTurns: number;
    requireHumanApproval: boolean;
    sensitiveDataHandling: string;
  };
  tools: any[];
  knowledgeBase: any[];
  greeting?: string;
  fallbackMessage?: string;
  handoffMessage?: string;
  businessHours?: any;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const agentConfigSchema = new Schema<IAgentConfig>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    channels: [{ type: String, enum: ['web', 'whatsapp', 'telegram'] }],
    llmConfig: {
      provider: { type: String, required: true, default: 'openai' },
      model: { type: String, required: true, default: 'gpt-4' },
      temperature: { type: Number, default: 0.7 },
      maxTokens: { type: Number, default: 1024 },
      systemPrompt: { type: String, required: true },
    },
    persona: {
      name: { type: String },
      tone: { type: String },
      role: { type: String },
    },
    guardrails: {
      blockedTopics: [{ type: String }],
      maxConversationTurns: { type: Number, default: 50 },
      requireHumanApproval: { type: Boolean, default: false },
      sensitiveDataHandling: { type: String, default: 'mask' },
    },
    tools: [Schema.Types.Mixed],
    knowledgeBase: [Schema.Types.Mixed],
    greeting: { type: String },
    fallbackMessage: { type: String },
    handoffMessage: { type: String },
    businessHours: Schema.Types.Mixed,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

agentConfigSchema.index({ tenantId: 1, status: 1 });
agentConfigSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const AgentConfig = model<IAgentConfig>('AgentConfig', agentConfigSchema);
