import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { AgentService } from '../../../core/services/agent.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-agent-config',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatSliderModule
  ],
  templateUrl: './agent-config.component.html',
  styleUrls: ['./agent-config.component.css']
})
export class AgentConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private agentService = inject(AgentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);

  isEditMode = false;
  agentId: string | null = null;
  isLoading = false;

  agentForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    status: ['active'],
    channels: [[] as string[]],
    greetingMessage: [''],
    fallbackMessage: [''],
    
    llmProvider: ['openai'],
    model: ['gpt-4-turbo'],
    temperature: [0.7],
    maxTokens: [2048],
    systemPrompt: [''],
    
    persona: this.fb.group({
      tone: ['professional'],
      language: ['english'],
      personality: ['helpful'],
      instructions: [''],
      requireHumanApproval: [false],
      sensitiveDataHandling: ['redact']
    }),
    
    knowledgeBase: this.fb.array([]),
    
    tools: this.fb.array([])
  });

  get knowledgeBase() {
    return this.agentForm.get('knowledgeBase') as FormArray;
  }

  get tools() {
    return this.agentForm.get('tools') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.agentId = params.get('id');
      if (this.agentId) {
        this.isEditMode = true;
        this.loadAgent(this.agentId);
      } else {
        this.addKnowledgeEntry();
      }
    });
  }

  loadAgent(id: string) {
    this.isLoading = true;
    this.agentService.getAgent(id).subscribe(res => {
      this.isLoading = false;
      if (res.success && res.data) {
        // Simple patch, assuming structure matches closely
        this.agentForm.patchValue(res.data);
        
        // Handle FormArrays
        if (res.data.knowledgeBase) {
          this.knowledgeBase.clear();
          res.data.knowledgeBase.forEach((entry: any) => {
            this.knowledgeBase.push(this.fb.group({
              title: [entry.title],
              content: [entry.content]
            }));
          });
        }
      }
    });
  }

  addKnowledgeEntry() {
    this.knowledgeBase.push(this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    }));
  }

  removeKnowledgeEntry(index: number) {
    this.knowledgeBase.removeAt(index);
  }

  onSubmit() {
    if (this.agentForm.invalid) {
      this.notification.error('Please fill out all required fields');
      return;
    }

    this.isLoading = true;
    const data = this.agentForm.value;

    const request = this.isEditMode && this.agentId
      ? this.agentService.updateAgent(this.agentId, data)
      : this.agentService.createAgent(data);

    request.subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.notification.success(`Agent ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/agents']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Failed to save agent');
      }
    });
  }
}
