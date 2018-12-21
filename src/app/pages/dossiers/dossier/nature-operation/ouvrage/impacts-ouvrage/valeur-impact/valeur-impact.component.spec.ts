import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ValeurImpactComponent } from './valeur-impact.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatAutocompleteModule } from '@angular/material';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';
import { ParametreDonneeSpec } from 'app/pages/dossiers/dossier/nature-operation/ouvrage/tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';
import { ValeursPossibles } from '../../tableau-dynamique-ouvrage/tableau-dynamique-ouvrage.interface';
import { FormControl } from '@angular/forms';

describe('ValeurImpactComponent', () => {
  let component: ValeurImpactComponent;
  let fixture: ComponentFixture<ValeurImpactComponent>;
  let dossierService: DossierService;

  const paremetreDonneeSpec: ParametreDonneeSpec = {
    id: null,
    typeDiscriminant: 'typeTest',
    codeDiscriminant: 'codeTest',
    codeParam: 'codeParamTest',
    label: 'labelTest',
    typeDonnee: 'typeDonneeTest',
    tailleDonnee: null,
    codeListe: 'codeListeTest',
    noOrdre: null

  }

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule
      ],
      declarations: [ValeurImpactComponent, FormatMonetairePipe],
      providers: [
        FormatMonetairePipe,
        { provide: TranslateService },
        { provide: DossierService, useClass: DossierServiceStub },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValeurImpactComponent);
    component = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);
    component.rowData = {
      id: 4,
      parametreDonneeSpec: paremetreDonneeSpec,
      valeurDate: '',
      valeurString: 'Test string',
      valeurInteger: '',
      valeurDouble: '',
      valeurListe: '',
      erreurValeur: false
    }
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * #erreurFonctionDate Should return a true when there is error
   */
  it('#erreurFonctionDate Should return a true when there is error', fakeAsync(() => {
    component.rowData = {
      id: 4,
      parametreDonneeSpec: paremetreDonneeSpec,
      valeurDate: '12/02/2010',
      valeurString: '',
      valeurInteger: '',
      valeurDouble: '',
      valeurListe: '',
      erreurValeur: false
    }
    spyOn(component, 'erreurFonctionDate').and.callThrough();
    component.erreurFonctionDate('il ya une erreur dans le tableau');
    fixture.detectChanges();
    tick();
    expect(component.rowData.erreurValeur).toBeTruthy();
  }));

  /**
  * #displayListeValeur Fonction d'affichage pour l'autocomplete de liste valeur à choix unique
  */
  it('#displayListeValeur Fonction pour afficher dans la liste autocomplete de valeur à choix unique', fakeAsync(() => {

    const valeurPossible: ValeursPossibles = {
      id: 2,
      codeParam: 'codeParamtest',
      libelleParam: 'libelleParamTest',
      code: 'USAG',
      libelle: 'STEP01',
      texte: 'TEST',
      noOrdre: ''
    }
    spyOn(component, 'displayListeValeur').and.callThrough();
    fixture.detectChanges();
    tick();
    expect(component.displayListeValeur(valeurPossible)).toBe('USAG - STEP01');
  }));


  /**
   * #listenChangeListe Permet de mettre à jour la liste observable de l'autocomplete Pour la liste à choix unique
   */
  it('#listenChangeListe Permet de mettre à jour la liste observable de autocomplete Pour la liste à choix unique', fakeAsync(() => {

    const paremetreDonneeSpec1: ParametreDonneeSpec = {
      id: null,
      typeDiscriminant: 'typeTest',
      codeDiscriminant: 'codeTest',
      codeParam: 'codeParamTest',
      label: 'labelTest',
      typeDonnee: 'typeDonneeTest',
      tailleDonnee: null,
      codeListe: 'fake code',
      noOrdre: null

    }
    component.rowData = {
      id: 4,
      parametreDonneeSpec: paremetreDonneeSpec1,
      valeurDate: '',
      valeurString: '',
      valeurInteger: '',
      valeurDouble: '',
      valeurListe: '',
      erreurValeur: false
    }

    const liste = dossierService.getvaleursImpactListe(component.rowData.parametreDonneeSpec.codeListe);
    spyOn(component, 'listenChangeListe').and.callThrough();
    component.controlValeurImpactListeChoixUnique = new FormControl();
    component.listenChangeListe(liste);
    fixture.detectChanges();
    tick();
    expect(component.rowData.erreurValeur).toBeFalsy();
  }));


  /**
   * #onBlurStringEvent deteche change of input text
   */
  it('#onBlurStringEvent deteche change of input text', fakeAsync(() => {
    component.controlValeur = new FormControl('test valeur string');
    spyOn(component, 'onBlurStringEvent').and.callThrough();
    component.onBlurStringEvent();
    fixture.detectChanges();
    tick();
    expect(component.rowData.valeurString).toBe('test valeur string');
    expect(component.rowData.erreurValeur).toBeFalsy();
  }));

  /**
  * #onBlurNumberEvent deteche change of input number
  */
  it('#onBlurNumberEvent deteche change of input number', fakeAsync(() => {
    component.controlValeurNumber = new FormControl(250);
    spyOn(component, 'onBlurNumberEvent').and.callThrough();
    component.onBlurNumberEvent();
    fixture.detectChanges();
    tick();
    expect(component.rowData.valeurInteger).toBe(250);
    expect(component.rowData.erreurValeur).toBe(false);
  }));

  /**
  * #onBlurReelEvent deteche change of input reel
  */
  it('#onBlurReelEvent deteche change of input reel', fakeAsync(() => {
    component.controlValeurReel = new FormControl(8120.00);
    spyOn(component, 'onBlurReelEvent').and.callThrough();
    component.onBlurReelEvent();
    fixture.detectChanges();
    tick();
    expect(component.rowData.valeurDouble).toBe(8120.00);
    expect(component.rowData.erreurValeur).toBe(false);
  }));

  /**
  * #onBlurDateEvent deteche change of input date
  */
  it('#onBlurDateEvent deteche change of input date', fakeAsync(() => {
    component.controlValeurDate = new FormControl('12/09/2018');
    spyOn(component, 'onBlurDateEvent').and.callThrough();
    component.controlImpactValeurDate(component.controlValeurDate.value, component.controlValeurDate);
    component.onBlurDateEvent();
    fixture.detectChanges();
    tick();
    expect(component.rowData.valeurDate).toBe('12/09/2018');
    expect(component.rowData.erreurValeur).toBe(false);
  }));

});


