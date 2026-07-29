import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/certifications/certification-list').then(m => m.CertificationList),
  },
  {
    path: 'certifications/:certificationId',
    loadComponent: () => import('./features/modules/module-list').then(m => m.ModuleList),
  },
  {
    path: 'certifications/:certificationId/quiz/module/:moduleId',
    loadComponent: () => import('./features/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'certifications/:certificationId/quiz/exam',
    loadComponent: () => import('./features/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'results/:sessionId',
    loadComponent: () => import('./features/results/results').then(m => m.Results),
  },
  { path: '**', redirectTo: '' },
];
