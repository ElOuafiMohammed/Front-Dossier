import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'app/theme/material/material.module';

import { ValeurInfoSpecComponent } from './valeur-info-spec.component';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'
import { DossierService } from './../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { TranslateModule } from '@ngx-translate/core';
import { MatNativeDateModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('ValeurInfoSpecComponent', () => {
  let component: ValeurInfoSpecComponent;
  let fixture: ComponentFixture<ValeurInfoSpecComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, MatNativeDateModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      declarations: [ValeurInfoSpecComponent, FormatMonetairePipe],
      providers: [FormatMonetairePipe,
        { provide: DossierService, useClass: DossierServiceStub }],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValeurInfoSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * #erreurFonctionDate Should return a true when there is error
   */
  // it('#erreurFonctionDate Should return a true when there is error', fakeAsync(() => {
  //   component.rowData = {
  //     id: 4,
  //     parametreDonneeSpec: paremetreDonneeSpec,
  //     valeurDate: '12/02/2010',
  //     valeurString: '',
  //     valeurInteger: '',
  //     valeurDouble: '',
  //     valeurListe: '',
  //     erreurValeur: false
  //   }
  //   spyOn(component, 'erreurFonctionDate').and.callThrough();
  //   component.erreurFonctionDate('il ya une erreur dans le tableau');
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.erreurValeur).toBeTruthy();
  // }));

  /**
   * #listenChangeListe Permet de mettre à jour la liste observable de l'autocomplete Pour la liste à choix unique
   */
  // it('#listenChangeListe Permet de mettre à jour la liste observable de autocomplete Pour la liste à choix unique', fakeAsync(() => {

  //   const paremetreDonneeSpec1: PrarametreDonneSpec = {
  //     id: null,
  //     typeDiscriminant: 'typeTest',
  //     codeDiscriminant: 'codeTest',
  //     codeParam: 'codeParamTest',
  //     label: 'labelTest',
  //     typeDonnee: 'typeDonneeTest',
  //     tailleDonnee: null,
  //     codeListe: 'fake code',
  //     noOrdre: null

  //   }
  //   component.rowData = {
  //     id: 4,
  //     parametreDonneeSpec: paremetreDonneeSpec1,
  //     valeurDate: null,
  //     valeurString: null,
  //     valeurInteger: null,
  //     valeurDouble: null,
  //     valeurListe: null
  //   }

  //   const liste = dossierService.getvaleursImpactListe(component.rowData.parametreDonneeSpec.codeListe);
  //   spyOn(component, 'listenChangeListe').and.callThrough();
  //   component.controlValeurImpactListeChoixUnique = new FormControl();
  //   component.listenChangeListe(liste);
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.erreurValeur).toBeFalsy();
  // }));


  /**
   * #onBlurStringEvent deteche change of input text
   */
  // it('#onBlurStringEvent deteche change of input text', fakeAsync(() => {
  //   component.controlValeur = new FormControl('test valeur string');
  //   spyOn(component, 'onBlurStringEvent').and.callThrough();
  //   component.onBlurStringEvent();
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.valeurString).toBe('test valeur string');
  //   expect(component.rowData.erreurValeur).toBeFalsy();
  // }));

  /**
  * #onBlurNumberEvent deteche change of input number
  */
  // it('#onBlurNumberEvent deteche change of input number', fakeAsync(() => {
  //   component.controlValeurNumber = new FormControl(250);
  //   spyOn(component, 'onBlurNumberEvent').and.callThrough();
  //   component.onBlurNumberEvent();
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.valeurInteger).toBe(250);
  //   expect(component.rowData.erreurValeur).toBe(false);
  // }));

  /**
  * #onBlurReelEvent deteche change of input reel
  */
  // it('#onBlurReelEvent deteche change of input reel', fakeAsync(() => {
  //   component.controlValeurReel = new FormControl(8120.00);
  //   spyOn(component, 'onBlurReelEvent').and.callThrough();
  //   component.onBlurReelEvent();
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.valeurDouble).toBe(8120.00);
  //   expect(component.rowData.erreurValeur).toBe(false);
  // }));

  /**
  * #onBlurDateEvent deteche change of input date
  */
  // it('#onBlurDateEvent deteche change of input date', fakeAsync(() => {
  //   component.controlValeurDate = new FormControl('12/09/2018');
  //   spyOn(component, 'onBlurDateEvent').and.callThrough();
  //   component.controlImpactValeurDate(component.controlValeurDate.value, component.controlValeurDate);
  //   component.onBlurDateEvent();
  //   fixture.detectChanges();
  //   tick();
  //   expect(component.rowData.valeurDate).toBe('12/09/2018');
  //   expect(component.rowData.erreurValeur).toBe(false);
  // }));

});


