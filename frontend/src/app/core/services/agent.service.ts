import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private api = inject(ApiService);

  getAgents(page: number = 1, limit: number = 10): Observable<ApiResponse<any>> {
    return this.api.get('/agents', { page, limit });
  }

  getAgent(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/agents/${id}`);
  }

  createAgent(data: any): Observable<ApiResponse<any>> {
    return this.api.post('/agents', data);
  }

  updateAgent(id: string, data: any): Observable<ApiResponse<any>> {
    return this.api.put(`/agents/${id}`, data);
  }

  deleteAgent(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/agents/${id}`);
  }

  updateKnowledgeBase(id: string, entries: any[]): Observable<ApiResponse<any>> {
    return this.api.put(`/agents/${id}/knowledge-base`, { entries });
  }
}
