import { AppError } from '../utils/app-error';

export class WebhookService {
  verifyWebhook(mode: string, token: string, challenge: string): string {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'fallback_token';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }
    throw new AppError('Webhook verification failed', 403);
  }

  processWebhookPayload(payload: any) {
    const entries = payload.entry || [];
    const normalizedMessages = [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.value && change.value.messages) {
          const messages = change.value.messages;
          const contacts = change.value.contacts || [];
          
          for (const msg of messages) {
            const contact = contacts.find((c: any) => c.wa_id === msg.from);
            normalizedMessages.push({
              from: msg.from,
              messageId: msg.id,
              timestamp: new Date(msg.timestamp * 1000),
              type: msg.type,
              content: msg.type === 'text' ? msg.text.body : null,
              contactName: contact ? contact.profile.name : 'Unknown'
            });
          }
        }
      }
    }

    return normalizedMessages;
  }
}

export const webhookService = new WebhookService();
