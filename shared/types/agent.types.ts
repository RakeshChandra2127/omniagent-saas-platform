export enum AgentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum AgentChannel {
  WHATSAPP = 'whatsapp',
  WEB_CHAT = 'web_chat',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface IAgentConfig {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: AgentStatus;
  channels: AgentChannel[];
  llmConfig: ILLMConfig;
  persona: IAgentPersona;
  guardrails: IGuardrails;
  tools: IAgentTool[];
  knowledgeBase: IKnowledgeEntry[];
  greeting: string;
  fallbackMessage: string;
  handoffMessage: string;
  businessHours?: IBusinessHours;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface IAgentPersona {
  tone: string;
  language: string;
  personality: string;
  instructions: string;
}

export interface IGuardrails {
  blockedTopics: string[];
  maxConversationTurns: number;
  requireHumanApproval: boolean;
  sensitiveDataHandling: 'redact' | 'warn' | 'block';
  allowedDomains: string[];
}

export interface IAgentTool {
  name: string;
  description: string;
  parameters: Record<string, IToolParameter>;
  enabled: boolean;
}

export interface IToolParameter {
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

export interface IKnowledgeEntry {
  title: string;
  content: string;
  source?: string;
  addedAt: Date;
}

export interface IBusinessHours {
  timezone: string;
  schedule: { day: number; start: string; end: string; enabled: boolean }[];
}
