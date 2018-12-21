import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';


import { MaterialModule } from 'app/theme/material/material.module';

import { DossierService } from '../../../dossiers.service';
import { TableauDynamCofinancementsComponent } from './tableau-dynam-cofinancements.component';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { FormatMonetairePipe } from 'app/theme/pipes/formatMonetaire/format-monetaire.pipe'
import { TranslateModule } from '@ngx-translate/core';



describe('TableauDynamCofinancementsComponent', () => {
  let component: TableauDynamCofinancementsComponent;
  let fixture: ComponentFixture<TableauDynamCofinancementsComponent>;

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
        FormatMonetairePipe
      ],

      declarations: [TableauDynamCofinancementsComponent],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauDynamCofinancementsComponent);
    component = fixture.componentInstance;
    // component.planFinancementDossier = {
    //   coFinanceurs: [
    //     {
    //       financeur: {
    //         code: 'string1',
    //         financeurPublic: true,
    //         id: 4,
    //         libelle: `Agence de l'eau `,
    //         disable: false
    //       },
    //       id: 44,
    //       precision: 'azerty',
    //       montantAide: 0,
    //       tauxAide: 0
    //     },
    //   ]
    // },
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#addLine should add a row in the table', () => {
    const spyNotifyParent = spyOn(component, 'notifyParentComponent').and.callThrough();
    const dataLength = component.data.length;
    component.onAddLine();
    expect(spyNotifyParent.calls.any()).toBe(false);
    expect(component.data.length).toBe(dataLength);
    expect(component.canAdd).toBe(false);
  });

  it('#onEditEvent should update the sipmle input of montants', () => {
    const cofinanceurs = {
      financeur: {
        code: 'string1',
        financeurPublic: true,
        id: 4,
        libelle: `Agence de l'eau `,
        disable: false
      },
      id: 44,
      precision: 'azerty',
      montantAide: 444,
      tauxAide: 4
    }
    const spyonEditEvent = spyOn(component, 'onEditEvent').and.callThrough();

    component.onEditEvent(this.financeur);

    expect(spyonEditEvent.calls.any()).toBe(true);

  });


  it('#onDeleteApplicationEvent should delete the passed financeur from the list', () => {

    const spyNotifyParent = spyOn(component, 'notifyParentComponent').and.callThrough();
    const dataLength = component.data.length;
    const sourceCount = component.source.count();
    component.onDeleteApplicationEvent(component.data[0]);
    expect(spyNotifyParent.calls.any()).toBe(true);


  });

});
