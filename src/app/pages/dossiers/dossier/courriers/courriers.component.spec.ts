import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'app/theme/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef, DateAdapter, MAT_DATE_LOCALE, MAT_DIALOG_DATA, MatAutocompleteModule, MatDialogModule } from '@angular/material';

import { CourriersComponent } from './courriers.component';
import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { Courrier } from './courrier.interface'
import { Observable, BehaviorSubject } from 'rxjs';


describe('CourriersComponent', () => {
  let component: CourriersComponent;
  let fixture: ComponentFixture<CourriersComponent>;
  const courrierSubjet = new BehaviorSubject<Courrier[]>([]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MaterialModule,
        BrowserAnimationsModule,
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        TranslateModule.forRoot()
      ],
      declarations: [CourriersComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: DossierService, useClass: DossierServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.courrierDataSource.connect = () => {
      return courrierSubjet.asObservable();
    }
    component.courrierDataSource.loadCourriers = (idDossier) => { courrierSubjet.next(courriersTest); }
    component.courrierDataSource.disconnect = () => { courrierSubjet.complete(); }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a courrier to source', fakeAsync(() => {
    let courriers = [];
    const courrierObservable: Observable<Courrier[]> = component.courrierDataSource.connect();
    courrierObservable.subscribe(courrier => {
      courriers = courrier;
    });
    component.courrierDataSource.loadCourriers(1);
    tick(500);
    component.courrierDataSource.disconnect();

    expect(courriers.length).toBe(3);
    expect(courriers[1].codeDocument).toBe('7c0759d5-4fdf-40e0-a582-3fec5a779a1c');
    expect(courriers[2].redacteur).toBe('MYRIAM');
  }));
});

const courriersTest: Courrier[] = [
  {
    codeDocument: '7c0759d5-4fdf-40e0-a582-3fec5a779a8a',
    destinataire: 'COND SOLONGBE',
    id: 1,
    objet: 'Je suis un courrier test',
    redacteur: 'MYRIAM MAS',
    reference: '70f093e1ea254cfe93685a88a4109329',
    urlFichier: 'http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx',
    urlOffice: 'ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx'
  },
  {
    codeDocument: '7c0759d5-4fdf-40e0-a582-3fec5a779a1c',
    destinataire: 'COND SOLONGBE',
    id: 2,
    objet: 'Je suis un courrier test',
    redacteur: 'MYRIAM MAS',
    reference: '70f093e1ea254cfe93685a88a4109329',
    urlFichier: 'http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx',
    urlOffice: 'ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx'
  },
  {
    codeDocument: '7c0759d5-4fdf-40e0-a582-3fec5a779a8a',
    destinataire: 'COND SOLONGBE',
    id: 3,
    objet: 'Je suis un courrier test',
    redacteur: 'MYRIAM',
    reference: '70f093e1ea254cfe93685a88a4109329',
    urlFichier: 'http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx',
    urlOffice: 'ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/70f093e1ea254cfe93685a88a4109329.docx'
  }]
