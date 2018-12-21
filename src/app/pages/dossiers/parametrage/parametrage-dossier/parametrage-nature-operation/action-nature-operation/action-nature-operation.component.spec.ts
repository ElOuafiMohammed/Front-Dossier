import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from 'app/theme/material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ActionNatureOperationComponent } from './action-nature-operation.component';

describe('ActionNatureOperationComponent', () => {
  let component: ActionNatureOperationComponent;
  let fixture: ComponentFixture<ActionNatureOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionNatureOperationComponent], imports: [
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionNatureOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
