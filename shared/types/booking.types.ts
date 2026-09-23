export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export interface IBooking {
  _id: string;
  tenantId: string;
  contactId: string;
  conversationId: string;
  agentConfigId: string;
  title: string;
  description?: string;
  status: BookingStatus;
  scheduledAt: Date;
  duration: number; // minutes
  timezone: string;
  location?: string;
  meetingLink?: string;
  attendees: IBookingAttendee[];
  reminders: IBookingReminder[];
  notes?: string;
  externalCalendarId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingAttendee {
  name: string;
  email?: string;
  phone?: string;
  role: 'host' | 'guest';
}

export interface IBookingReminder {
  type: 'email' | 'sms' | 'whatsapp';
  minutesBefore: number;
  sent: boolean;
  sentAt?: Date;
}
