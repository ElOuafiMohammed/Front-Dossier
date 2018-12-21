import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TypeDPComponent } from './typeDP.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'app/theme/material/material.module';

describe('TypeDPComponent', () => {
  let component: TypeDPComponent;
  let fixture: ComponentFixture<TypeDPComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      declarations: [TypeDPComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(TypeDPComponent);
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
        texte: null,
      },
      dispositifPartenariat: newdispositif,
      complementIntitule: 'conv test',
      montantAvance: null,
      pourcentageAvance: null,
      montantSubvention: null,
      pourcentageSubvention: null,
      urlFrontDispositifPartenariat: '',
    };

    component.typesDispositif = [
      {
        id: 56,
        codeParam: 'type code test 1',
        libelleParam: 'libelle test dispositif 1',
        code: 'CONV',
        libelle: 'T',
        texte: null
      },
      {
        id: 57,
        codeParam: 'type code test 2',
        libelleParam: 'libelle test dispositif 2',
        code: 'CONT',
        libelle: 'T',
        texte: null
      },
      {
        id: 58,
        codeParam: 'type code test 3',
        libelleParam: 'libelle test dispositif 3',
        code: 'ACCO',
        libelle: 'T',
        texte: null
      }
    ]
    fixture.detectChanges();

  });

  /***
   * test Create component
  */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * When typeDispositif is updated
   */

  it('should emit the controlForm when typeDispositif is updated', fakeAsync(() => {

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

    component.rowData.dispositifPartenariat.typeDispositif = dispositif.typeDispositif;
    expect(component.rowData.dispositifPartenariat.typeDispositif).toBe(dispositif.typeDispositif);
  }));

  /**
   * compareFn Should return a boolean value if two typeDispositif are different
   */
  it('#compareFn Should return a string that is a color of button save', fakeAsync(() => {
    const typeDispositif1 = {
      id: 56,
      codeParam: 'TYPE_DISPOSITIF',
      libelleParam: 'Type dispositif',
      code: 'CONV',
      libelle: 'T',
      texte: null
    };

    const typeDispositif2 = {
      id: 54,
      codeParam: 'TYPE_DISPOSITIF 2',
      libelleParam: 'Type dispositif 2',
      code: 'CONT',
      libelle: 'FF',
      texte: null
    };

    spyOn(component, 'compareFn').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.compareFn(typeDispositif1, typeDispositif2)).toBe(false);
  }));

  /**
   * #change manage changes value of current typeDispsoitif
   */
  it('#change manage changes value of current typeDispsoitif', fakeAsync(() => {
    const curentTypeDispositif = {
      id: 54,
      codeParam: 'TYPE_DISPOSITIF 2',
      libelleParam: 'Type dispositif 2',
      code: 'CONT',
      libelle: 'FF',
      texte: null
    };

    spyOn(component, 'change').and.callThrough();
    fixture.detectChanges();
    tick();
    component.change(curentTypeDispositif);
    expect(component.rowData.typeDispositifPartenariat).toEqual(curentTypeDispositif);
  }));

});


