import { Router } from 'express';
import { contactService } from '../services/contact.service';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middleware/auth.middleware';
import { tenantContext } from '../middleware/tenant.middleware';

const router = Router();

router.use(authenticate, tenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await contactService.findAll(req.tenantId!, req.query, page, limit);
  res.json({ success: true, data: result });
}));

router.post('/', asyncHandler(async (req, res) => {
  const result = await contactService.create(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: result });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await contactService.findById(req.tenantId!, req.params.id);
  res.json({ success: true, data: result });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const result = await contactService.update(req.tenantId!, req.params.id, req.body);
  res.json({ success: true, data: result });
}));

export default router;
