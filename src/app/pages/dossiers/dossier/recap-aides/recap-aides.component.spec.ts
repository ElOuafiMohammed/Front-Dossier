import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecapAidesComponent } from './recap-aides.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DossierServiceStub } from '../../dossiers.service.spec';
import { DossierService } from '../../dossiers.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';
import { CommonModule } from '@angular/common';
import { EncadrementCommJustif } from '../dossier.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material';
import { By } from '@angular/platform-browser';


describe('RecapAidesComponent', () => {
  let componentInstance: RecapAidesComponent;
  let fixture: ComponentFixture<RecapAidesComponent>;
  let slideToggle: MatSlideToggle;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        RouterTestingModule,
        TranslateModule.forRoot()

      ],
      declarations: [RecapAidesComponent],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecapAidesComponent);
    componentInstance = fixture.componentInstance;
    const slideToggleDebug = fixture.debugElement.query(By.css('mat-slide-toggle'));
    slideToggle = slideToggleDebug.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have a valid form by default', () => {
    expect(componentInstance.formRecaputilatif.valid).toBeTruthy();
  });

  it('should manage valid encadrements communautaire field value', () => {
    const form = componentInstance.formRecaputilatif;
    const encadrementControl = componentInstance.encadrementControl;

    expect(encadrementControl.errors).toBeNull();
    expect(form.valid).toBeTruthy();

    const encadrementInvalidValue: EncadrementCommJustif[] = [{ id: 1, code: 'INVA', libelle: 'PLan d actions', texte: 'text1' }];
    encadrementControl.setValue(encadrementInvalidValue);

    expect(form.valid).toBeTruthy();
  });

  it('should set the toggle to checked on interaction', () => {
    expect(slideToggle.checked).toBeFalsy();

    slideToggle.checked = true;
    expect(slideToggle.checked).toBeTruthy();

    slideToggle.checked = false;
    expect(slideToggle.checked).toBeFalsy();

  });

  it('should set empty justif when toggle is checked ', () => {
    const justifControl = componentInstance.justifControl;

    slideToggle.checked = true;
    expect(justifControl.value).toEqual(null);

    slideToggle.checked = false;
    expect(justifControl.value).toEqual(null);

  });

  it('should emit the formRecaputilatif when some data is updated', () => {
    const form = componentInstance.formRecaputilatif;
    const justifControl = componentInstance.justifControl;

    const spyNotifyParent = spyOn(componentInstance, 'notifyParentComponent').and.callThrough();
    expect(spyNotifyParent.calls.any()).toBe(false);

    componentInstance.onRecaputilatifFormChange
      .subscribe((outputValue: FormGroup) => {
        expect(outputValue).toBe(form);
        expect(outputValue.valid).toBeTruthy();
      });

    const fakeToggleSilderChangeEvent = new MatSlideToggleChange(null, true);
    justifControl.setValue(fakeToggleSilderChangeEvent);
    expect(spyNotifyParent.calls.count()).toBe(1);

  });
});
