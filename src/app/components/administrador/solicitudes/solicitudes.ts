import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes.html'
})
export class SolicitudesComponent {
  // Mock alineado con SolicitudAyudantiaDto
  solicitudes = [
    { ayudantiaId: 1, estudianteId: 1, nombreEstudiante: 'María González', catedraId: 101, nombreCatedra: 'Cálculo Avanzado', estado: 'Pendiente' },
    { ayudantiaId: 2, estudianteId: 2, nombreEstudiante: 'Carlos Pérez', catedraId: 102, nombreCatedra: 'Mecánica Cuántica', estado: 'Pendiente' }
  ];

  aprobar(id: number) {
    console.log('Aprobando solicitud ID:', id);
    // Conexión futura: POST api/coordinador/ayudantias/asignar
  }

  rechazar(id: number) {
    console.log('Rechazando solicitud ID:', id);
    // Conexión futura: PUT api/coordinador/ayudantias/{id}/estado
  }
}
