import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private api = inject(ApiService);

  getContacts(page: number = 1, limit: number = 10): Observable<ApiResponse<any>> {
    return this.api.get('/contacts', { page, limit });
  }

  getContact(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/contacts/${id}`);
  }

  createContact(data: any): Observable<ApiResponse<any>> {
    return this.api.post('/contacts', data);
  }

  updateContact(id: string, data: any): Observable<ApiResponse<any>> {
    return this.api.put(`/contacts/${id}`, data);
  }
}
