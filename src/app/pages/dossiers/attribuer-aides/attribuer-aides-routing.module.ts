import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AttribuerAidesComponent } from './attribuer-aides.component';

const routes: Routes = [
  {
    path: '',
    component: AttribuerAidesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttribuerAidesRoutingModule { }
