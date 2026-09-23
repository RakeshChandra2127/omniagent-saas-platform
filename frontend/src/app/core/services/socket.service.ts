import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private authService = inject(AuthService);

  connect(): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(environment.wsUrl, {
      auth: { token },
      autoConnect: true
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      if (!this.socket) this.connect();
      
      this.socket?.on(event, (data: T) => {
        observer.next(data);
      });

      return () => {
        this.socket?.off(event);
      };
    });
  }

  emit(event: string, data: any): void {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }

  onNewMessage(): Observable<any> {
    return this.on<any>('newMessage');
  }

  onConversationUpdated(): Observable<any> {
    return this.on<any>('conversationUpdated');
  }

  onLeadCreated(): Observable<any> {
    return this.on<any>('leadCreated');
  }

  onBookingCreated(): Observable<any> {
    return this.on<any>('bookingCreated');
  }

  joinConversation(conversationId: string): void {
    this.emit('joinConversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.emit('leaveConversation', { conversationId });
  }
}
