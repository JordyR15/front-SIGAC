import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expediente.html'
})
export class ExpedienteComponent {
  // Alineado con ExpedienteDto
  expediente = {
    estudianteId: 1,
    nombreEstudiante: 'María González',
    historial: [
      { nombreCatedra: 'Cálculo Avanzado', calificacionFinal: 4.8, periodo: 'Otoño 2024' },
      { nombreCatedra: 'Mecánica Cuántica', calificacionFinal: 4.5, periodo: 'Otoño 2024' }
    ],
    indicadores: [
      { id: 1, estudianteId: 1, catedraId: 101, indicador: 'Participación', observacion: 'Siempre participa', fecha: '2026-08-10' }
    ]
  };
}
