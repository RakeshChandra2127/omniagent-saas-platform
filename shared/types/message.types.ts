export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  TEMPLATE = 'template',
  INTERACTIVE = 'interactive',
}

export interface IMessage {
  _id: string;
  tenantId: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  contentType: MessageContentType;
  status: MessageStatus;
  metadata: IMessageMetadata;
  toolCalls?: IToolCall[];
  toolResult?: IToolResult;
  tokens?: ITokenUsage;
  externalId?: string;
  createdAt: Date;
}

export interface IMessageMetadata {
  whatsappMessageId?: string;
  providerLatencyMs?: number;
  modelUsed?: string;
  retryCount?: number;
}

export interface IToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface IToolResult {
  toolCallId: string;
  name: string;
  result: Record<string, unknown>;
  success: boolean;
}

export interface ITokenUsage {
  prompt: number;
  completion: number;
  total: number;
}
