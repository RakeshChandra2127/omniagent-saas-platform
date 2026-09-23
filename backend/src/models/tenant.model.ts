import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  domain?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  settings: {
    maxAgents: number;
    maxUsers: number;
    maxContactsPerMonth: number;
    maxMessagesPerMonth: number;
    features: string[];
    whatsappConfig?: {
      phoneNumberId: string;
      wabaId: string;
    };
  };
  billing: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
    settings: {
      maxAgents: { type: Number, default: 1 },
      maxUsers: { type: Number, default: 1 },
      maxContactsPerMonth: { type: Number, default: 100 },
      maxMessagesPerMonth: { type: Number, default: 1000 },
      features: [{ type: String }],
      whatsappConfig: {
        phoneNumberId: { type: String },
        wabaId: { type: String },
      },
    },
    billing: {
      stripeCustomerId: { type: String },
      subscriptionId: { type: String },
      currentPeriodEnd: { type: Date },
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 }, { unique: true });
tenantSchema.index({ status: 1 });

export const Tenant = model<ITenant>('Tenant', tenantSchema);
