import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFactoryResolver } from '@angular/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';


import { ListRemarquesComponent } from './list-remarques.component';
import { DossierService } from '../../../dossiers.service';
import { DossierServiceStub } from '../../../dossiers.service.spec';
import { RemarqueComponent } from '../remarque.component';

describe('ListRemarquesComponent', () => {
  let component: ListRemarquesComponent;
  let fixture: ComponentFixture<ListRemarquesComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListRemarquesComponent],
      providers: [ComponentFactoryResolver,
        { provide: DossierService, useClass: DossierServiceStub }
      ]
    })
      .compileComponents();
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [RemarqueComponent]
      }
    });

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRemarquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should instantiatе hosted component correctly', () => {
    // const content = 'test';
    // const properties = { content: content };
    // const data: RemarqueComponent = new RemarqueComponent();
    // const dataBIs: any = {
    //   type: RemarqueComponent

    // }
    // component.remarqueComponent = dataBIs;

    // fixture.detectChanges();
    // expect(fixture.componentInstance.listCourentRemarques).toBe(1);
    // expect(fixture.componentInstance.instance.content).toBe(content);
  });
});
