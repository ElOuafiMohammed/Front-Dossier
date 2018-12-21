import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import * as moment from 'moment';
import { MatAutocompleteModule} from '@angular/material';
import { DossierService } from '../../dossiers.service';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { AccueilService } from '../../accueil/accueil.service'
import { TranslateModule } from '@ngx-translate/core';
import { RemarqueComponent } from './remarque.component';
import { ReponseComponent } from './reponse/reponse.component';

describe('RemarqueComponent', () => {
  let component: RemarqueComponent;
  let fixture: ComponentFixture<RemarqueComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        RouterTestingModule,
        MatAutocompleteModule,
        TranslateModule.forRoot()
      ],
      providers: [ComponentFactoryResolver,
        { provide: DossierService, useClass: DossierServiceStub },
        {
          provide: AccueilService
        }
      ],
      declarations: [RemarqueComponent],

      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ReponseComponent]
      }
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should  component created with date remarque be equal now', () => {
    const now = moment().locale('fr').format('DD/MM/YYYY HH:mm');
    expect(component.dateDujourControl.value).toEqual(now)
    expect(component.remarqueControl.value).toEqual('');
  });

});
