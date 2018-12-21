import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'app/theme/material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { AppService } from 'app/app.service';
import { AppServiceStub } from 'app/app.service.spec';
import { DispositifsRattachesPrevComponent } from './dispositifs-rattaches-prev.component';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { TranslateModule } from '@ngx-translate/core';
import { TypeDispositif } from 'app/pages/dossiers/dossier/dossier.interface';

describe('DispositifsRattachesPrevComponent', () => {
  let component: DispositifsRattachesPrevComponent;
  let fixture: ComponentFixture<DispositifsRattachesPrevComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()

      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: AppService, useClass: AppServiceStub }
      ],

      declarations: [DispositifsRattachesPrevComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DispositifsRattachesPrevComponent);
    component = fixture.componentInstance;

    const typeDispositif: TypeDispositif = {
      id: 0,
      libelle: 'test',
      code: 'test',
      codeParam: 'test',
      libelleParam: 'test',
      texte: 'test'
    };

    component.data = [
      {
        id: 0,
        typeDispositif: typeDispositif,
        isSansObjet: false,
        numeroOrdre: 0,
        complementIntitule: 'test',
        urlFrontDispositifPartenariat: ''
      },
      {
        id: 1,
        typeDispositif: typeDispositif,
        isSansObjet: false,
        numeroOrdre: 1,
        complementIntitule: 'test1',
        urlFrontDispositifPartenariat: ''
      }
    ];

  }));

  /**
   * Create component
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * addDispositif should add a row in the table
   */
  it('#addDispositif should add a row in the table', () => {
    const dataLength = component.data.length;
    component.onAddDispositif();
    expect(component.data.length).toBe(dataLength + 1);
    expect(component.data[dataLength].numeroOrdre).toBeNull();
  });


  /**
   * onDeleteDispositif should delete the passed dispositif from the list
   */
  it('#onDeleteDispositif should delete the passed dispositif from the list', () => {
    component.loadDataSource();
    const dataLength = component.data.length;
    component.onDeleteDispositifEvent(component.data[0]);
    expect(component.canAdd).toBeTruthy();
    expect(component.data.length).toBe(dataLength - 1);
  });

  /**
   * #manageCanAdd should add true when to manage the addition of new line of dispositif
   */
  it('#manageCanAdd should add true when to manage the addition of new line of dispositif', () => {
    component.manageCanAdd(true);
    expect(component.canAdd).toBeTruthy();
    expect(component.enableMessageError).toBeFalsy();
  });


  /**
  * #manageCanAdd should add false when to manage the addition of new line of dispositif
  */
  it('#manageCanAdd should add false when to manage the addition of new line of dispositif', () => {
    component.manageCanAdd(false);
    expect(component.canAdd).toBeFalsy();
    expect(component.enableMessageError).toBeTruthy();
  });

});
