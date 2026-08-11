import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento.html'
})
export class SeguimientoComponent {
  // Mock alineado con SolicitudAyudantiaDto (estado Activa)
  ayudantias = [
    { ayudantiaId: 1, nombreEstudiante: 'Ana López', nombreCatedra: 'Cálculo Avanzado', estado: 'Activa' },
    { ayudantiaId: 2, nombreEstudiante: 'Luis Martínez', nombreCatedra: 'Mecánica Cuántica', estado: 'Activa' }
  ];
}
