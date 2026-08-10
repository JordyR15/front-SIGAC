import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionDiagnostica } from './evaluacion-diagnostica';

describe('EvaluacionDiagnostica', () => {
  let component: EvaluacionDiagnostica;
  let fixture: ComponentFixture<EvaluacionDiagnostica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionDiagnostica],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionDiagnostica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
