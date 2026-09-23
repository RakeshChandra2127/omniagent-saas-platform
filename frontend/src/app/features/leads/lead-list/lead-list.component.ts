import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LeadService } from '../../../core/services/lead.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSelectModule, MatFormFieldModule, TimeAgoPipe, StatusBadgeComponent],
  templateUrl: './lead-list.component.html',
  styleUrls: ['./lead-list.component.css']
})
export class LeadListComponent implements OnInit {
  private leadService = inject(LeadService);
  
  displayedColumns: string[] = ['title', 'contact', 'status', 'priority', 'value', 'created'];
  dataSource: any[] = [];
  
  ngOnInit() {
    this.leadService.getLeads().subscribe(res => {
      if (res.success) {
        this.dataSource = res.data;
      }
    });
  }
}
