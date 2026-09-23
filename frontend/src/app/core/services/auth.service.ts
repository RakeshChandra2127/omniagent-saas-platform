import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  constructor() {
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) {
      try {
        // Basic JWT decode for the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          id: payload.id,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          tenantId: payload.tenantId
        });
      } catch (e) {
        this.logout();
      }
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('omniagent_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(credentials: any): Observable<ApiResponse<{ token: string, user: User }>> {
    return this.api.post<{ token: string, user: User }>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          localStorage.setItem('omniagent_token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  register(data: any): Observable<ApiResponse<{ token: string, user: User }>> {
    return this.api.post<{ token: string, user: User }>('/auth/register', data).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          localStorage.setItem('omniagent_token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('omniagent_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
