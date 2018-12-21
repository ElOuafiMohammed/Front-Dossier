import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule } from 'app/theme/nga.module';

import { Ng2SmartTableModule } from 'ng2-smart-table';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableauRecapDesNumerosComponent } from './tableau-recap-des-numeros.component';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { FormatMonetairePipe } from 'app//theme/pipes/formatMonetaire/format-monetaire.pipe';


describe('Unit Test of TableauMontantAideTotalComponent', () => {
  let componentInstance: TableauRecapDesNumerosComponent;
  let fixture: ComponentFixture<TableauRecapDesNumerosComponent>;
  let dossierService: DossierService;
  let pipe: FormatMonetairePipe;
  beforeEach(() => {
    pipe = new FormatMonetairePipe();
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule
      ],
      declarations: [
        TableauRecapDesNumerosComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: FormatMonetairePipe, useValue: pipe },
      ]
    });

    fixture = TestBed.createComponent(TableauRecapDesNumerosComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

});
