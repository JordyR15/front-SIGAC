import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-materias-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './materias-admin.html'
})
export class MateriasAdminComponent {
  // Lista de materias (simulada)
  materias = [
    {
      id: 101,
      nombre: 'Cálculo Avanzado',
      codigo: 'MAT-301',
      docente: 'Dra. Evelyn Vance',
      ayudantes: ['Ana López', 'Carlos Ruiz'],
      estudiantes: [
        { id: 1, nombre: 'Alejandro García', nota: 4.8, asistencia: 94 },
        { id: 2, nombre: 'María López', nota: 4.5, asistencia: 88 }
      ]
    },
    {
      id: 102,
      nombre: 'Mecánica Cuántica',
      codigo: 'FIS-401',
      docente: 'Dr. Marcus Thorne',
      ayudantes: [],
      estudiantes: [
        { id: 3, nombre: 'Carlos Ruiz', nota: 4.9, asistencia: 97 }
      ]
    }
  ];
}
