import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'inbox', 
    loadComponent: () => import('./features/inbox/inbox.component').then(m => m.InboxComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'agents', 
    loadComponent: () => import('./features/agent-config/agent-list/agent-list.component').then(m => m.AgentListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'agents/new', 
    loadComponent: () => import('./features/agent-config/agent-config/agent-config.component').then(m => m.AgentConfigComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'agents/:id', 
    loadComponent: () => import('./features/agent-config/agent-config/agent-config.component').then(m => m.AgentConfigComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'contacts', 
    loadComponent: () => import('./features/contacts/contact-list/contact-list.component').then(m => m.ContactListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'leads', 
    loadComponent: () => import('./features/leads/lead-list/lead-list.component').then(m => m.LeadListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'bookings', 
    loadComponent: () => import('./features/bookings/booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [authGuard]
  }
];
