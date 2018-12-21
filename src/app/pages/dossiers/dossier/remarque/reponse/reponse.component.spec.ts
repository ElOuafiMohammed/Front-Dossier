import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReponseComponent } from './reponse.component';


import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import * as moment from 'moment';
import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { AccueilService } from '../../../accueil/accueil.service'
describe('ReponseComponent', () => {
  let component: ReponseComponent;
  let fixture: ComponentFixture<ReponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        RouterTestingModule
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: AccueilService }
      ],
      declarations: [ReponseComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should  component created with date remarque be equal now', () => {
    const now = moment().locale('fr').format('DD/MM/YYYY HH:mm');
    expect(component.dateDujourControl.value).toEqual(now)
    expect(component.reponseControl.value).toEqual('');
  });
});
