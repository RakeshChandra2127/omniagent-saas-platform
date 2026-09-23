export enum TenantPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

export interface ITenant {
  _id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: TenantPlan;
  status: TenantStatus;
  settings: ITenantSettings;
  billing: IBillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantSettings {
  maxAgents: number;
  maxUsers: number;
  maxContactsPerMonth: number;
  maxMessagesPerMonth: number;
  features: string[];
  whatsappConfig?: IWhatsAppConfig;
}

export interface IWhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

export interface IBillingInfo {
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: Date;
}
