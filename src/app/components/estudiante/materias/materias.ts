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
  // Mock basado en los DTOs del backend
  // En el futuro, esto vendrá de: GET /api/estudiante/materias (o similar)
  materias = [
    {
      id: 101,
      nombre: 'Cálculo Avanzado',
      descripcion: 'Derivadas parciales, integrales múltiples y ecuaciones diferenciales.',
      codigo: 'MAT-301',
      docenteResponsable: {
        id: 5,
        username: 'evance',
        persona: { nombre: 'Evelyn', apellido: 'Vance' }
      }
    },
    {
      id: 102,
      nombre: 'Mecánica Cuántica',
      descripcion: 'Principios fundamentales de la mecánica cuántica y su aplicación.',
      codigo: 'FIS-401',
      docenteResponsable: {
        id: 6,
        username: 'mthorne',
        persona: { nombre: 'Marcus', apellido: 'Thorne' }
      }
    },
    {
      id: 103,
      nombre: 'Redes Neuronales',
      descripcion: 'Arquitecturas de redes neuronales y aprendizaje profundo.',
      codigo: 'CMP-501',
      docenteResponsable: {
        id: 7,
        username: 'schen',
        persona: { nombre: 'Sarah', apellido: 'Chen' }
      }
    }
  ];
}
