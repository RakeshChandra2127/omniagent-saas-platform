export enum ConversationStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  HANDED_OFF = 'handed_off',
  EXPIRED = 'expired',
}

export enum ConversationChannel {
  WHATSAPP = 'whatsapp',
  WEB_CHAT = 'web_chat',
  SMS = 'sms',
  EMAIL = 'email',
}

export interface IConversation {
  _id: string;
  tenantId: string;
  agentConfigId: string;
  contactId: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  assignedTo?: string;
  metadata: IConversationMetadata;
  tags: string[];
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationMetadata {
  source?: string;
  campaign?: string;
  referrer?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}
