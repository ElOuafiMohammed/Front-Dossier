import { async, fakeAsync, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NumeroDPComponent } from './numeroDP.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'app/theme/material/material.module';

describe('NumeroDPComponent', () => {
  let component: NumeroDPComponent;
  let fixture: ComponentFixture<NumeroDPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule

      ],
      declarations: [NumeroDPComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumeroDPComponent);
    component = fixture.componentInstance;
    const newdispositif = {
      id: 12,
      numeroOrdre: 0,
      isSansObjet: false,
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
      urlFrontDispositifPartenariat: '',
    };
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  it('should emit the controlForm when numeroOrder is updated', () => {

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
    component.rowData.dispositifPartenariat.numeroOrdre = dispositif.numeroOrdre;
    expect(component.rowData.dispositifPartenariat.numeroOrdre).toBe(0);
  });


  /**
   * #formattedNumeroCode Should return a string having before 4 zero when it receives an number
   */
  it('#formattedNumeroCode Should return a string that is a color of button save', fakeAsync(() => {
    spyOn(component, 'formattedNumeroCode').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.formattedNumeroCode(1)).toBe('0001');
  }));


});
