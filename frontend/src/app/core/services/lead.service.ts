import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private api = inject(ApiService);

  getLeads(filters?: any): Observable<ApiResponse<any>> {
    return this.api.get('/leads', filters);
  }

  getLead(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/leads/${id}`);
  }

  updateLead(id: string, data: any): Observable<ApiResponse<any>> {
    return this.api.put(`/leads/${id}`, data);
  }

  addNote(id: string, content: string): Observable<ApiResponse<any>> {
    return this.api.post(`/leads/${id}/notes`, { content });
  }
}
