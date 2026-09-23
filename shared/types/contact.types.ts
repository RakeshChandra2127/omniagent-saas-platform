export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  WON = 'won',
  LOST = 'lost',
}

export interface IContact {
  _id: string;
  tenantId: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  status: ContactStatus;
  leadStatus: LeadStatus;
  source: string;
  tags: string[];
  customFields: Record<string, unknown>;
  lastContactedAt?: Date;
  totalConversations: number;
  createdAt: Date;
  updatedAt: Date;
}
