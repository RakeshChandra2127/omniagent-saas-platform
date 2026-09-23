import { Router } from 'express';
import { agentConfigService } from '../services/agent-config.service';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { tenantContext } from '../middleware/tenant.middleware';

const router = Router();

router.use(authenticate, tenantContext, authorize('tenant_admin', 'agent_manager'));

router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await agentConfigService.findAll(req.tenantId!, req.query, page, limit);
  res.json({ success: true, data: result });
}));

router.post('/', asyncHandler(async (req, res) => {
  const result = await agentConfigService.create(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: result });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await agentConfigService.findById(req.tenantId!, req.params.id);
  res.json({ success: true, data: result });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const result = await agentConfigService.update(req.tenantId!, req.params.id, req.body);
  res.json({ success: true, data: result });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await agentConfigService.delete(req.tenantId!, req.params.id);
  res.json({ success: true, data: result });
}));

router.put('/:id/knowledge-base', asyncHandler(async (req, res) => {
  const result = await agentConfigService.updateKnowledgeBase(req.tenantId!, req.params.id, req.body.entries);
  res.json({ success: true, data: result });
}));

export default router;
