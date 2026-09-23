import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  metrics = {
    totalConversations: 0,
    activeConversations: 0,
    totalLeads: 0,
    totalBookings: 0,
    messagesToday: 0
  };

  isLoading = true;

  ngOnInit() {
    this.api.get<any>('/analytics/dashboard').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.metrics = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Handle error gracefully or rely on global interceptor
      }
    });
  }
}
