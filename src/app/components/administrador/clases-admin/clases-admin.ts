import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-clases-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './clases-admin.html'
})
export class ClasesAdminComponent {
  clases = [
    {
      id: 1,
      nombre: 'Ingeniería de Software 2026-2',
      semestre: '2026-2',
      materias: [
        { id: 101, nombre: 'Cálculo Avanzado', codigo: 'MAT-301', docente: 'Dra. Evelyn Vance' },
        { id: 102, nombre: 'Mecánica Cuántica', codigo: 'FIS-401', docente: 'Dr. Marcus Thorne' }
      ]
    },
    {
      id: 2,
      nombre: 'Ciencias de la Computación 2026-1',
      semestre: '2026-1',
      materias: [
        { id: 201, nombre: 'Redes Neuronales', codigo: 'CMP-501', docente: 'Prof. Sarah Chen' }
      ]
    }
  ];
}
