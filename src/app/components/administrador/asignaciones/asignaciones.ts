import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaciones.html'
})
export class AsignacionesComponent {
  // Mock de estudiantes aprobados y cátedras
  estudiantes = [
    { id: 1, nombre: 'María González' },
    { id: 2, nombre: 'Carlos Pérez' }
  ];
  catedras = [
    { id: 101, nombre: 'Cálculo Avanzado' },
    { id: 102, nombre: 'Mecánica Cuántica' }
  ];

  asignacion = {
    ayudantiaId: 0
  };

  asignar() {
    console.log('Asignando ayudante (ID de ayudantía):', this.asignacion.ayudantiaId);
    // Conexión futura: POST api/coordinador/ayudantias/asignar con AsignacionAyudantiaDto
  }
}
