import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleInterlocuteurSelectComponent } from './role-interlocuteur-select.component';

xdescribe('RoleInterlocuteurSelectComponent', () => {
  let component: RoleInterlocuteurSelectComponent;
  let fixture: ComponentFixture<RoleInterlocuteurSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RoleInterlocuteurSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleInterlocuteurSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
