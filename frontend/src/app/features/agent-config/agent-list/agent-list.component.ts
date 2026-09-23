import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgentService } from '../../../core/services/agent.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, TimeAgoPipe],
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css']
})
export class AgentListComponent implements OnInit {
  private agentService = inject(AgentService);
  
  displayedColumns: string[] = ['name', 'status', 'channels', 'created', 'actions'];
  dataSource: any[] = [];
  
  ngOnInit() {
    this.loadAgents();
  }
  
  loadAgents() {
    this.agentService.getAgents().subscribe(res => {
      if (res.success) {
        this.dataSource = res.data;
      }
    });
  }

  deleteAgent(id: string) {
    if(confirm('Are you sure you want to delete this agent?')) {
      this.agentService.deleteAgent(id).subscribe(res => {
        if(res.success) {
          this.loadAgents();
        }
      });
    }
  }
}
