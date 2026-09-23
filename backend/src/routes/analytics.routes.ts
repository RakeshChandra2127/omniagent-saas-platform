import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { authenticate } from '../middleware/auth.middleware';
import { tenantContext } from '../middleware/tenant.middleware';
import { Conversation } from '../models/conversation.model';
import { Lead } from '../models/lead.model';
import { Booking } from '../models/booking.model';
import { Message } from '../models/message.model';

const router = Router();

router.use(authenticate, tenantContext);

router.get('/dashboard', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalConversations,
    activeConversations,
    totalLeads,
    totalBookings,
    messagesToday
  ] = await Promise.all([
    Conversation.countDocuments({ tenantId }),
    Conversation.countDocuments({ tenantId, status: 'active' }),
    Lead.countDocuments({ tenantId }),
    Booking.countDocuments({ tenantId }),
    Message.countDocuments({ tenantId, createdAt: { $gte: startOfDay } })
  ]);

  res.json({
    success: true,
    data: {
      totalConversations,
      activeConversations,
      totalLeads,
      totalBookings,
      messagesToday
    }
  });
}));

export default router;
