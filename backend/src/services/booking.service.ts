import { AppError } from '../utils/app-error';
import { Booking } from '../models/booking.model';

export class BookingService {
  async create(tenantId: string, data: any) {
    return await Booking.create({ ...data, tenantId });
  }

  async findAll(tenantId: string, filters: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };
    
    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('contactId').skip(skip).limit(limit).sort({ startTime: 1 }),
      Booking.countDocuments(query)
    ]);
    
    return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const booking = await Booking.findOne({ _id: id, tenantId }).populate('contactId');
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    return booking;
  }

  async update(tenantId: string, id: string, data: any) {
    const booking = await Booking.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: data },
      { new: true }
    );
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    return booking;
  }

  async cancel(tenantId: string, id: string, reason: string) {
    const booking = await Booking.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status: 'cancelled', cancellationReason: reason } },
      { new: true }
    );
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    return booking;
  }
}

export const bookingService = new BookingService();
