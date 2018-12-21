import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: 'accueil' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
