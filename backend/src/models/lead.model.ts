import { Schema, model, Document, Types } from 'mongoose';

export interface ILead extends Document {
  tenantId: Types.ObjectId;
  contactId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  agentConfigId?: Types.ObjectId;
  title: string;
  description?: string;
  status: 'new' | 'contacting' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  extractedData?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    requirement?: string;
    budget?: string;
    timeline?: string;
  };
  assignedTo?: Types.ObjectId;
  notes: {
    content: string;
    createdBy?: Types.ObjectId;
    createdAt: Date;
  }[];
  value?: number;
  currency?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    agentConfigId: { type: Schema.Types.ObjectId, ref: 'AgentConfig' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['new', 'contacting', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], default: 'new' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    extractedData: {
      name: String,
      email: String,
      phone: String,
      company: String,
      requirement: String,
      budget: String,
      timeline: String,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: [
      {
        content: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    value: { type: Number },
    currency: { type: String, default: 'USD' },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
leadSchema.index({ tenantId: 1, contactId: 1 });

export const Lead = model<ILead>('Lead', leadSchema);
