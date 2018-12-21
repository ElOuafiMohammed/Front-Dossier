import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgaModule } from 'app/theme/nga.module';

import { ListValeur } from 'app/pages/dossiers/dossiers.interface';

import { CardComponent } from './card-siga.component';
import { DossierService } from 'app/pages/dossiers/dossiers.service';
import { DossierServiceStub } from 'app/pages/dossiers/dossiers.service.spec';

describe('ThematiqueCardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const listValeur: ListValeur = {
    'id': 1,
    'code': 'AGRO',
    'libelle': 'Agro-alimentaire'
  };

  describe('unit tests => ', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          NgaModule.forRoot()
        ],
        declarations: [
          CardComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: DossierServiceStub }
        ]
      });

      fixture = TestBed.createComponent(CardComponent);
      component = fixture.componentInstance;

      component.listValeur = listValeur;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });


    it('#onDeleteEvent should emmit on the eventEmmiter: deleteEventEmitter ', () => {
      fixture.detectChanges();

      spyOn(component.deleteEventEmitter, 'emit');
      component.onDeleteEvent(event);
      expect(component.deleteEventEmitter.emit).toHaveBeenCalled();
    });
  });
});
