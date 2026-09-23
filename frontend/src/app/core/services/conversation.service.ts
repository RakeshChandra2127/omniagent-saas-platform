import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private api = inject(ApiService);

  getConversations(filters?: any): Observable<ApiResponse<any>> {
    return this.api.get('/conversations', filters);
  }

  getConversation(id: string): Observable<ApiResponse<any>> {
    return this.api.get(`/conversations/${id}`);
  }

  getMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<ApiResponse<any>> {
    return this.api.get(`/conversations/${conversationId}/messages`, { page, limit });
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return this.api.patch(`/conversations/${id}/status`, { status });
  }
}
