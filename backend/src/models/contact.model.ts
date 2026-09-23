import { Schema, model, Document, Types } from 'mongoose';

export interface IContact extends Document {
  tenantId: Types.ObjectId;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  status: 'active' | 'inactive' | 'blocked';
  leadStatus: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source?: string;
  tags: string[];
  customFields?: any;
  lastContactedAt?: Date;
  totalConversations: number;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    firstName: { type: String },
    lastName: { type: String },
    displayName: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    leadStatus: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'], default: 'new' },
    source: { type: String },
    tags: [{ type: String }],
    customFields: { type: Schema.Types.Mixed },
    lastContactedAt: { type: Date },
    totalConversations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contactSchema.index({ tenantId: 1, phone: 1 }, { unique: true, sparse: true });
contactSchema.index({ tenantId: 1, email: 1 }, { sparse: true });
contactSchema.index({ tenantId: 1, leadStatus: 1 });
contactSchema.index({ tenantId: 1, createdAt: -1 });

export const Contact = model<IContact>('Contact', contactSchema);
