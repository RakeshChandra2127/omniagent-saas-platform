import { Router } from 'express';
import { conversationService } from '../services/conversation.service';
import { messageService } from '../services/message.service';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middleware/auth.middleware';
import { tenantContext } from '../middleware/tenant.middleware';

const router = Router();

router.use(authenticate, tenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const { status, channel, agentConfigId } = req.query;
  const filters: any = {};
  if (status) filters.status = status;
  if (channel) filters.channel = channel;
  if (agentConfigId) filters.agentConfigId = agentConfigId;

  const result = await conversationService.findAll(req.tenantId!, filters, page, limit);
  res.json({ success: true, data: result });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await conversationService.findById(req.tenantId!, req.params.id);
  res.json({ success: true, data: result });
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const result = await conversationService.updateStatus(req.tenantId!, req.params.id, req.body.status);
  res.json({ success: true, data: result });
}));

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await messageService.findByConversation(req.tenantId!, req.params.id, page, limit);
  res.json({ success: true, data: result });
}));

export default router;
