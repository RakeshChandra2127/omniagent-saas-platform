import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ContactService } from '../../../core/services/contact.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, TimeAgoPipe],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
  private contactService = inject(ContactService);
  
  displayedColumns: string[] = ['name', 'phone', 'email', 'leadStatus', 'source', 'lastContacted'];
  dataSource: any[] = [];
  
  ngOnInit() {
    this.contactService.getContacts().subscribe(res => {
      if (res.success) {
        this.dataSource = res.data;
      }
    });
  }
}
