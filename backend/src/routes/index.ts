import { Router } from 'express';
import authRoutes from './auth.routes';
import agentConfigRoutes from './agent-config.routes';
import conversationRoutes from './conversation.routes';
import contactRoutes from './contact.routes';
import leadRoutes from './lead.routes';
import bookingRoutes from './booking.routes';
import webhookRoutes from './webhook.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/agents', agentConfigRoutes);
router.use('/conversations', conversationRoutes);
router.use('/contacts', contactRoutes);
router.use('/leads', leadRoutes);
router.use('/bookings', bookingRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
