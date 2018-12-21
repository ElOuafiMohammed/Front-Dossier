import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule } from 'app/theme/nga.module';

import { Ng2SmartTableModule } from 'ng2-smart-table';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableauMontantAideTotalComponent } from './tableau-montant-aide-total.component';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { FormatMonetairePipe } from '../../../../../theme/pipes/formatMonetaire/format-monetaire.pipe';


describe('Unit Test of TableauMontantAideTotalComponent', () => {
  let componentInstance: TableauMontantAideTotalComponent;
  let fixture: ComponentFixture<TableauMontantAideTotalComponent>;
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
        TableauMontantAideTotalComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: FormatMonetairePipe, useValue: pipe },
      ]
    });

    fixture = TestBed.createComponent(TableauMontantAideTotalComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('#loadDataSource have to load datas by calling load method of our LocalDataSource', () => {
    fixture.detectChanges();
    const mockData = [];
    const spyLoadLocalDataSource = spyOn(componentInstance.source, 'load').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');

    componentInstance.loadDataSource(mockData);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');

  });


});
