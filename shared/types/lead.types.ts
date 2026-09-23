import { LeadStatus } from './contact.types';

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ILead {
  _id: string;
  tenantId: string;
  contactId: string;
  conversationId: string;
  agentConfigId: string;
  title: string;
  description?: string;
  status: LeadStatus;
  priority: LeadPriority;
  extractedData: IExtractedLeadData;
  assignedTo?: string;
  notes: ILeadNote[];
  value?: number;
  currency?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExtractedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  requirement?: string;
  budget?: string;
  timeline?: string;
  [key: string]: unknown;
}

export interface ILeadNote {
  content: string;
  createdBy: string;
  createdAt: Date;
}

export { LeadStatus };
