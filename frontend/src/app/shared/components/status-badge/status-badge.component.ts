import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClass(): string {
    const s = this.status?.toLowerCase() || '';
    if (s === 'active' || s === 'open' || s === 'completed' || s === 'won') {
      return 'badge-success';
    }
    if (s === 'waiting' || s === 'pending' || s === 'in_progress') {
      return 'badge-warning';
    }
    if (s === 'resolved' || s === 'closed' || s === 'cancelled' || s === 'lost') {
      return 'badge-neutral';
    }
    return 'badge-default';
  }
}
