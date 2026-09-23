export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  time: number;
  changes?: WebhookChange[];
  messaging?: WebhookMessaging[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: { display_phone_number: string; phone_number_id: string };
    contacts?: { profile: { name: string }; wa_id: string }[];
    messages?: {
      from: string;
      id: string;
      timestamp: string;
      text?: { body: string };
      type: string;
      image?: { id: string; mime_type: string; caption?: string };
      document?: { id: string; mime_type: string; filename?: string };
    }[];
    statuses?: {
      id: string;
      status: string;
      timestamp: string;
      recipient_id: string;
    }[];
  };
  field: string;
}

export interface WebhookMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text: string };
}
