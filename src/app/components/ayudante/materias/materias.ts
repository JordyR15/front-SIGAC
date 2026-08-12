import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ayudante-materias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './materias.html'
})
export class AyudanteMateriasComponent {
  materias = [
    { id: 101, nombre: 'Cálculo Avanzado', codigo: 'MAT-301', docente: 'Dra. Evelyn Vance' },
    { id: 102, nombre: 'Mecánica Cuántica', codigo: 'FIS-401', docente: 'Dr. Marcus Thorne' }
  ];

  agregarRecurso(materiaId: number) {
    console.log('Añadir recurso a materia:', materiaId);
  }
}
