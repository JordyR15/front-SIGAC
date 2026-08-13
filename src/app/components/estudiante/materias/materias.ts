import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- Ya importado

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './materias.html'
})
export class MateriasComponent {
  // Datos mock (seguirán usándose hasta que el backend responda)
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

  constructor(private http: HttpClient) {} // Inyectamos HttpClient

  // Este método se llamará cuando el backend esté listo
  cargarMaterias() {
    // this.http.get('/api/estudiante/materias').subscribe(data => this.materias = data);
  }
}
