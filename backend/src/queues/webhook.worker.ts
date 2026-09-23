import { Worker } from 'bullmq';
import { redisConfig } from './queue.config';
import { webhookService } from '../services/webhook.service';
import { contactService } from '../services/contact.service';
import { conversationService } from '../services/conversation.service';
import { messageService } from '../services/message.service';
import { llmService } from '../services/llm.service';
import { agentConfigService } from '../services/agent-config.service';
import { emitToTenant, emitToConversation } from '../websocket/socket.service';

export const webhookWorker = new Worker('webhook-processing', async job => {
  console.log(`[WebhookWorker] Processing job ${job.id}`);
  try {
    const payload = job.data;
    const messages = webhookService.processWebhookPayload(payload);
    
    for (const msg of messages) {
      if (!msg.content) continue;
      
      // We assume default tenant for now unless webhook provides mapping
      const tenantId = process.env.DEFAULT_TENANT_ID || 'default_tenant'; 
      const agentConfigId = process.env.DEFAULT_AGENT_ID || 'default_agent';
      
      const contact = await contactService.findOrCreateByPhone(tenantId, msg.from, msg.contactName);
      const conversation = await conversationService.getOrCreateForContact(tenantId, contact.id, agentConfigId, 'whatsapp');
      
      const savedMessage = await messageService.create(tenantId, conversation.id, {
        sender: 'user',
        content: msg.content,
        externalId: msg.messageId,
        status: 'received'
      });

      emitToConversation(conversation.id, 'new_message', savedMessage);
      emitToTenant(tenantId, 'conversation_updated', conversation);

      // Simple LLM orchestration
      const agentConfig = await agentConfigService.findById(tenantId, agentConfigId);
      const historyRes = await messageService.findByConversation(tenantId, conversation.id, 1, 10);
      
      const assistantResponse = await llmService.processMessage(agentConfig, historyRes.messages, msg.content, {
        tenantId,
        conversationId: conversation.id,
        contactId: contact.id,
        agentConfigId
      });

      if (assistantResponse) {
        const replyMsg = await messageService.create(tenantId, conversation.id, {
          sender: 'assistant',
          content: assistantResponse,
          status: 'sent'
        });
        emitToConversation(conversation.id, 'new_message', replyMsg);
      }
    }
  } catch (error) {
    console.error(`[WebhookWorker] Failed to process job ${job.id}`, error);
    throw error;
  }
}, { 
  connection: redisConfig,
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});

webhookWorker.on('completed', job => console.log(`Job ${job.id} completed.`));
webhookWorker.on('failed', (job, err) => console.log(`Job ${job?.id} failed:`, err));
