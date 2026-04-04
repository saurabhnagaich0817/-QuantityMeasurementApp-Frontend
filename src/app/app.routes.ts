import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'add', loadComponent: () => import('./features/operations/add/add.component').then(m => m.AddComponent) },
      { path: 'subtract', loadComponent: () => import('./features/operations/subtract/subtract.component').then(m => m.SubtractComponent) },
      { path: 'divide', loadComponent: () => import('./features/operations/divide/divide.component').then(m => m.DivideComponent) },
      { path: 'compare', loadComponent: () => import('./features/operations/compare/compare.component').then(m => m.CompareComponent) },
      { path: 'convert', loadComponent: () => import('./features/operations/convert/convert.component').then(m => m.ConvertComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent) }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];