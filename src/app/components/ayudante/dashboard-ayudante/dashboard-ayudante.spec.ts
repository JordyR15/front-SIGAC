import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAyudante } from './dashboard-ayudante';

describe('DashboardAyudante', () => {
  let component: DashboardAyudante;
  let fixture: ComponentFixture<DashboardAyudante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAyudante],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAyudante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
