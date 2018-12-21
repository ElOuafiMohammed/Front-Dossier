import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgaModule } from '../theme/nga.module';
import { PagesComponent } from './pages.component';
import { routing } from './pages.routing';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing
  ],
  declarations: [PagesComponent]
})
export class PagesModule {
}
