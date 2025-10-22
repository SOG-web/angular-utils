import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
  { path: 'font', loadComponent: () => import('./font-demo/font-demo').then((m) => m.FontDemo) },
  { path: 'docs', loadComponent: () => import('./docs/docs').then((m) => m.DocsComponent) },
  { path: '**', redirectTo: '' },
];
