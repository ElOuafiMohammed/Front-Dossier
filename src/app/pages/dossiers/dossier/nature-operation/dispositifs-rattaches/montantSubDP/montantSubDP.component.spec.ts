import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MontantSubDPComponent } from './montantSubDP.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'app/theme/material/material.module';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';

describe('MontantSubventionDPComponent', () => {
  let component: MontantSubDPComponent;
  let fixture: ComponentFixture<MontantSubDPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule

      ],
      declarations: [MontantSubDPComponent, FormatMonetairePipe],
      providers: [
        FormatMonetairePipe
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MontantSubDPComponent);
    component = fixture.componentInstance;
    const newdispositif = {
      id: 12,
      numeroOrdre: 0,
      typeDispositif: {
        id: 56,
        codeParam: 'type code test',
        libelleParam: 'libelle test dispositif',
        code: 'CONV',
        libelle: 'T',
        texte: null
      },
      complementIntitule: 'test complement Intiule',
      urlFrontDispositifPartenariat: ''
    };

    component.rowData = {
      id: 12,
      numeroOrdre: null,
      idDispositifPartenariat: 12,
      typeDispositifPartenariat: {
        id: null,
        codeParam: null,
        libelleParam: null,
        code: null,
        libelle: null,
        texte: null
      },
      dispositifPartenariat: newdispositif,
      complementIntitule: 'conv test',
      montantAvance: null,
      pourcentageAvance: null,
      montantSubvention: null,
      pourcentageSubvention: null,
      urlFrontDispositifPartenariat: ''
    };
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the controlForm when montantSubvention is updated', () => {

    const dispositif = {
      id: 12,
      typeDispositif: {
        id: 56,
        codeParam: 'TYPE_DISPOSITIF',
        libelleParam: 'Type dispositif',
        code: 'CONV',
        libelle: 'T',
        texte: null
      },
      numeroOrdre: 0,
      complementIntitule: 'S.C.I. CLINIQUE DE BEAUPUY',
      urlFrontDispositifPartenariat: ''
    };

    const dispositifPartenariatOperation = {
      id: 12,
      numeroOrdre: null,
      idDispositifPartenariat: 12,
      typeDispositifPartenariat: {
        id: null,
        codeParam: null,
        libelleParam: null,
        code: null,
        libelle: null,
        texte: null
      },
      dispositifPartenariat: dispositif,
      complementIntitule: 'conv test',
      montantAvance: null,
      pourcentageAvance: null,
      montantSubvention: 80,
      pourcentageSubvention: null,
      urlFrontDispositifPartenariat: ''
    };

    component.rowData.montantSubvention = dispositifPartenariatOperation.montantSubvention;
    expect(component.rowData.montantSubvention).toBe(80);
  });

});
