import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, Subject, Observable, merge, of } from 'rxjs';
import { takeUntil, switchMap, scan, map, filter, startWith, tap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ConversationService } from '../../../core/services/conversation.service';
import { SocketService } from '../../../core/services/socket.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatListModule, MatIconModule, MatInputModule, 
    MatFormFieldModule, MatSelectModule, MatButtonModule, MatCardModule, 
    MatProgressSpinnerModule, TimeAgoPipe, TruncatePipe, StatusBadgeComponent
  ],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  private conversationService = inject(ConversationService);
  private socketService = inject(SocketService);

  private destroy$ = new Subject<void>();
  
  // Conversations State
  conversations$ = new BehaviorSubject<any[]>([]);
  statusFilter = 'all';
  
  // Selected Conversation State
  selectedConversation$ = new BehaviorSubject<any | null>(null);
  
  // Messages State
  messages$ = new BehaviorSubject<any[]>([]);
  isTyping = false;

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor() {
    // Handle socket updates
    this.socketService.onConversationUpdated().pipe(takeUntilDestroyed()).subscribe(conv => {
      const current = this.conversations$.getValue();
      const idx = current.findIndex(c => c.id === conv.id);
      if (idx !== -1) {
        const updated = [...current];
        updated[idx] = { ...updated[idx], ...conv };
        this.conversations$.next(updated);
      } else {
        this.conversations$.next([conv, ...current]);
      }
      
      const selected = this.selectedConversation$.getValue();
      if (selected && selected.id === conv.id) {
         this.selectedConversation$.next({ ...selected, ...conv });
      }
    });

    this.socketService.onNewMessage().pipe(takeUntilDestroyed()).subscribe(msg => {
      const selected = this.selectedConversation$.getValue();
      if (selected && selected.id === msg.conversationId) {
        this.messages$.next([...this.messages$.getValue(), msg]);
        this.isTyping = false;
      }
    });
  }

  ngOnInit() {
    this.socketService.connect();
    this.loadConversations();

    // When conversation selected, load its messages
    this.selectedConversation$.pipe(
      takeUntil(this.destroy$),
      filter(c => !!c),
      switchMap(c => {
        this.messages$.next([]);
        this.socketService.joinConversation(c.id);
        return this.conversationService.getMessages(c.id).pipe(
          catchError(() => of({ data: [] }))
        );
      })
    ).subscribe((res: any) => {
      this.messages$.next(res.data.reverse()); // Assume API returns newest first, reverse for display
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked() {        
    this.scrollToBottom();        
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    const selected = this.selectedConversation$.getValue();
    if (selected) {
      this.socketService.leaveConversation(selected.id);
    }
  }

  loadConversations() {
    const filters = this.statusFilter !== 'all' ? { status: this.statusFilter } : {};
    this.conversationService.getConversations(filters).subscribe(res => {
      if (res.success) {
        this.conversations$.next(res.data);
      }
    });
  }

  onFilterChange() {
    this.loadConversations();
  }

  selectConversation(conv: any) {
    const selected = this.selectedConversation$.getValue();
    if (selected) {
      this.socketService.leaveConversation(selected.id);
    }
    this.selectedConversation$.next(conv);
  }

  changeStatus(status: string) {
    const selected = this.selectedConversation$.getValue();
    if (selected) {
      this.conversationService.updateStatus(selected.id, status).subscribe(res => {
        if (res.success) {
          this.selectedConversation$.next({ ...selected, status });
        }
      });
    }
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
