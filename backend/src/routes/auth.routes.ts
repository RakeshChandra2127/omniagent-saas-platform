import { Router } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { tenantName, email, password, firstName, lastName } = req.body;
  const result = await authService.register(tenantName, email, password, firstName, lastName);
  res.status(201).json({ success: true, data: result });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
}));

export default router;
