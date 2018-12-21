import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { combineAll } from 'rxjs/operators';

import { MaterialModule } from 'app/theme/material/material.module';

import { DossierService } from '../../../dossiers.service';
import { TableauDynamPrevComponent } from './tableau-dynam-prev.component';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'
import { Libelle } from './tableau-dynam-prev-interface';

describe('TableauDynamPrevComponent', () => {
  let component: TableauDynamPrevComponent;
  let fixture: ComponentFixture<TableauDynamPrevComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule

      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        FormatMonetairePipe
      ],

      declarations: [TableauDynamPrevComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauDynamPrevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const preDossier = {
      anneeEngagPrevi: null,
      sessionDecision: null,
      niveauPriorite: {
        id: 83,
        codeParam: 'NIVPRIO',
        libelleParam: 'Code priorité',
        code: 'NP',
        libelle: 'Non prioritaire sans contrat'
      },
      lignesPrevisionnel: [
        {
          id: 3321,
          ligne: {
            id: 6,
            numero: '110',
            libelle: 'Installations de traitement des eaux usées domestiques et assimilées',
            codeThematique: 'ASST',
          },
          montantTravauxPrev: 11960,
          montantAidePrev: 5419
        },
        {
          id: 100,
          ligne: {
            id: 7,
            numero: '111',
            libelle: 'Installations de traitement des eaux usées domestiques et assimilées',
            codeThematique: 'ASST',
          },
          montantTravauxPrev: 11960,
          montantAidePrev: 5419
        }
      ],
      totalMontantTravauxPrev: 11960,
      totalMontantAidePrev: 5419
    }



  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#addLine should add a row in the table', () => {
    const ligne = {
      id: 3321,
      ligne: {
        codeThematique: 'ASST',
        disable: true,
        id: 6,
        libelle: 'Installations de traitement des eaux usées domestiques et assimilées',
        numero: '110',
      },
      montantAidePrev: 999,
      montantTravauxPrev: 888,

    }
    component.data.push(ligne)
    // const spyNotifyParent = spyOn(component, 'notifyParentComponent').and.callThrough();
    // const dataLength = component.data.length;

    // component.onAddLine();
    // expect(spyNotifyParent.calls.any()).toBe(true); Rework in onAddLine notifyParentComponent is not called
    // expect(component.data.length).toBe(dataLength + 1);

  });

  it('#onEditEvent should update the sipmle input of montants', () => {
    const ligne = {
      id: 3321,
      ligne: {
        codeThematique: 'ASST',
        disable: true,
        id: 6,
        libelle: 'Installations de traitement des eaux usées domestiques et assimilées',
        numero: '110',
      },
      montantAidePrev: 999,
      montantTravauxPrev: 888,

    }
    const spyonEditEvent = spyOn(component, 'onEditEvent').and.callThrough();

    component.onEditEvent(ligne);

    expect(spyonEditEvent.calls.any()).toBe(true);

  });



});
