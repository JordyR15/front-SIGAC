import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html'
})
export class AlertasComponent {
  // Alineado con AlertaTempranaDto
  alertas = [
    { estudianteId: 1, nombreEstudiante: 'María González', promedioActual: 2.8, alertaActiva: true },
    { estudianteId: 2, nombreEstudiante: 'Carlos Pérez', promedioActual: 3.2, alertaActiva: true }
  ];
}
