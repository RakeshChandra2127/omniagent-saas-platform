import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BookingService } from '../../../core/services/booking.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, StatusBadgeComponent],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  
  displayedColumns: string[] = ['title', 'contact', 'status', 'scheduledAt', 'duration', 'location'];
  dataSource: any[] = [];
  
  ngOnInit() {
    this.bookingService.getBookings().subscribe(res => {
      if (res.success) {
        this.dataSource = res.data;
      }
    });
  }
}
