import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages.component';

export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', loadChildren: './dossiers/dossiers.module#DossiersModule' }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
