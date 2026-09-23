import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  tenantId: Types.ObjectId;
  contactId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  agentConfigId?: Types.ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';
  scheduledAt: Date;
  duration: number; // in minutes
  timezone: string;
  location?: string;
  meetingLink?: string;
  attendees: {
    email: string;
    name?: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
  }[];
  reminders: {
    type: 'email' | 'sms' | 'whatsapp';
    minutesBefore: number;
    sent: boolean;
  }[];
  notes?: string;
  externalCalendarId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    agentConfigId: { type: Schema.Types.ObjectId, ref: 'AgentConfig' },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'], default: 'pending' },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, default: 30 },
    timezone: { type: String, required: true, default: 'UTC' },
    location: { type: String },
    meetingLink: { type: String },
    attendees: [
      {
        email: { type: String, required: true },
        name: String,
        status: { type: String, enum: ['invited', 'accepted', 'declined', 'tentative'], default: 'invited' },
      },
    ],
    reminders: [
      {
        type: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
        minutesBefore: { type: Number, required: true },
        sent: { type: Boolean, default: false },
      },
    ],
    notes: { type: String },
    externalCalendarId: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ tenantId: 1, scheduledAt: 1 });
bookingSchema.index({ tenantId: 1, status: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
