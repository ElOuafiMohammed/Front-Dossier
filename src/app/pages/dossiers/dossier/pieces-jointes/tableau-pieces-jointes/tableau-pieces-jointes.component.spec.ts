import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TableauPiecesJointesComponent } from './tableau-pieces-jointes.component';
import { PieceJointe } from '../pieces-jointes.interface';
import { DatePipe } from '@angular/common';
import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { AccueilService } from '../../../accueil/accueil.service';
import { AccueilServiceStub } from '../../../accueil/accueil.service.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material';
import { SpinnerLuncher } from '../../../../../shared/methodes-generiques';
import { SpinnerLuncherStub } from '../../../../../shared/test.helper';

const pieceJointesTest = [
  {
    id: 1,
    titre: 'DTAEEP-09-00001_1.docx',
    codeDoc: 'f4c510e6-c3db-427e-a38e-e845423eff29',
    reference: null,
    createur: 'JEAN AKKA1',
    dateCreation: 1531474537781,
    dateModification: null,
    fichier: null,
    fichierContentType: null,
    urlFichier: 'http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx',
    urlOffice: 'ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx'
  },
  {
    id: 2,
    titre: 'DTAEEP-10-00001_2.docx',
    codeDoc: 'aec510e6-c3db-427e-a38e-e845423eff29',
    reference: null,
    createur: 'JEAN AKKA1',
    dateCreation: 1531474537781,
    dateModification: null,
    fichier: null,
    fichierContentType: null,
    urlFichier: 'http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx',
    urlOffice: 'ms-word:ofe|u|http://integration.siga.akka.eu:8088/webdav/document/SIGA_DOSSIERS/7d78754372274d92b9b3df1f42821153.docx'
  }
];


describe('TableauPiecesJointesComponent', () => {
  let component: TableauPiecesJointesComponent;
  let fixture: ComponentFixture<TableauPiecesJointesComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatTableModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: AccueilService, useClass: AccueilServiceStub },
        { provide: SpinnerLuncher, useClass: SpinnerLuncherStub },
        DatePipe
      ],

      declarations: [TableauPiecesJointesComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });

    fixture = TestBed.createComponent(TableauPiecesJointesComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.pieceJointeDataSource.ajoutPieceJointe(pieceJointesTest);
  });

  it('#onAddLine should add a row in the table', fakeAsync(() => {
    const oldLength = component.pieceJointeDataSource.getLength();
    const filetest = new File([new ArrayBuffer(2e+5)], 'test-file.jpg', { lastModified: null, type: 'image/jpeg' });
    const fileList: FileList = {
      0: filetest,
      length: 1,
      item: (index: number) => filetest
    };
    component.onAddLine(fileList);
    const newLength = component.pieceJointeDataSource.getLength();
    tick(500);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(newLength).toBe(oldLength);
    });
  }));

  it('#onAddLine should add multiple rows in the table', fakeAsync(() => {
    component.pieceJointeDataSource.ajoutPieceJointe(pieceJointesTest);
    fixture.detectChanges();
    const oldLength = component.pieceJointeDataSource.getLength();

    const filetest1 = new File([new ArrayBuffer(2e+5)], 'test-file1.jpg', { lastModified: null, type: 'image/jpeg' });
    const filetest2 = new File([new ArrayBuffer(2e+5)], 'test-file2.jpg', { lastModified: null, type: 'image/jpeg' });
    const filetest3 = new File([new ArrayBuffer(2e+5)], 'test-file3.jpg', { lastModified: null, type: 'image/jpeg' });
    const fileList: FileList = {
      0: filetest1,
      1: filetest2,
      2: filetest3,
      length: 3,
      item: (index: number) => fileList[index]
    };

    component.onAddLine(fileList);
    tick(500);
    fixture.detectChanges();
    const newLength = component.pieceJointeDataSource.getLength();
    fixture.whenStable().then(() => {
      expect(newLength).toBe(oldLength + 1);
    });
  }));

  it('#onDeleteLine should delete a row in the table', () => {
    const dataLength = component.pieceJointeDataSource.getLength();
    const sourceCount = component.pieceJointeDataSource.getLength();
    const indexToDelete = 1;
    const pieceToDelete: PieceJointe = pieceJointesTest[indexToDelete];
    component.onDeleteLine(pieceToDelete);
    expect(component.pieceJointeDataSource.getLength()).toBe(dataLength - 1);
    expect(component.pieceJointeDataSource.getLength()).toBe(sourceCount - 1);
  });

  afterEach(() => {
    component.pieceJointeDataSource.disconnect();
  })
})
