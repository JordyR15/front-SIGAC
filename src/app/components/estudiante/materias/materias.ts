import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './materias.html'
})
export class MateriasComponent {
  materias = [
    {
      id: 101,
      nombre: 'Cálculo Avanzado',
      descripcion: 'Derivadas parciales, integrales múltiples y ecuaciones diferenciales.',
      codigo: 'MAT-301',
      docente: 'Dra. Evelyn Vance'
    },
    {
      id: 102,
      nombre: 'Mecánica Cuántica',
      descripcion: 'Principios fundamentales de la mecánica cuántica y su aplicación.',
      codigo: 'FIS-401',
      docente: 'Dr. Marcus Thorne'
    }
  ];
}
