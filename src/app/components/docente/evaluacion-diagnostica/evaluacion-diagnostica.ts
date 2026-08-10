import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluacion-diagnostica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluacion-diagnostica.html'
})
export class EvaluacionDiagnosticaComponent {
  // Alineado con EvaluacionDto (EsDiagnostica = true)
  diagnostico = {
    catedraId: 101,
    nombre: 'Evaluación Diagnóstica Inicial',
    estudiantes: [
      { nombre: 'María González', calificacion: 0, observacion: '' },
      { nombre: 'Carlos Pérez', calificacion: 0, observacion: '' }
    ]
  };

  registrar() {
    console.log('Registrando diagnóstico:', this.diagnostico);
  }
}
