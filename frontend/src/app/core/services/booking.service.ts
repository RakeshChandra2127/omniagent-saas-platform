import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private api = inject(ApiService);

  getBookings(filters?: any): Observable<ApiResponse<any>> {
    return this.api.get('/bookings', filters);
  }

  getBooking(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/bookings/${id}`);
  }

  cancelBooking(id: string, reason: string): Observable<ApiResponse<any>> {
    return this.api.post(`/bookings/${id}/cancel`, { reason });
  }
}
