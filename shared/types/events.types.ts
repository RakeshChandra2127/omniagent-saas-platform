export enum SocketEvent {
  // Connection
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  AUTH_ERROR = 'auth_error',

  // Conversations
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  CONVERSATION_UPDATED = 'conversation_updated',
  NEW_CONVERSATION = 'new_conversation',

  // Messages
  NEW_MESSAGE = 'new_message',
  MESSAGE_STATUS_UPDATED = 'message_status_updated',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',

  // Leads & Bookings
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',

  // Notifications
  NOTIFICATION = 'notification',
  AGENT_STATUS_CHANGED = 'agent_status_changed',

  // Errors
  ERROR = 'error',
}

export interface SocketEventPayload {
  tenantId: string;
  data: unknown;
  timestamp: Date;
}
