import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosAyudante } from './horarios-ayudante';

describe('HorariosAyudante', () => {
  let component: HorariosAyudante;
  let fixture: ComponentFixture<HorariosAyudante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosAyudante],
    }).compileComponents();

    fixture = TestBed.createComponent(HorariosAyudante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
