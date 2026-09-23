import { Router } from 'express';
import { webhookService } from '../services/webhook.service';
import { asyncHandler } from '../utils/async-handler';
import { webhookQueue } from '../queues/queue.config';

const router = Router();

router.get('/whatsapp', asyncHandler(async (req, res) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const result = webhookService.verifyWebhook(mode, token, challenge);
  res.send(result);
}));

router.post('/whatsapp', asyncHandler(async (req, res) => {
  // Push to BullMQ for processing
  await webhookQueue.add('process-whatsapp-webhook', req.body);
  res.sendStatus(200);
}));

export default router;
