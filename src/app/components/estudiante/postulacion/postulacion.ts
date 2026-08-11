import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-postulacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulacion.html'
})
export class PostulacionComponent {
  // Mock: Lista de cátedras disponibles (cuando el backend exista, esto vendrá de una API)
  catedras = [
    { id: 101, nombre: 'Cálculo Avanzado' },
    { id: 102, nombre: 'Mecánica Cuántica' },
    { id: 103, nombre: 'Redes Neuronales' }
  ];

  // DTO que se enviará al backend (PostulacionAyudantiaDto)
  postulacion = {
    catedraId: 0
  };

  enviarPostulacion() {
    console.log('Enviando postulación para la cátedra ID:', this.postulacion.catedraId);
    // Cuando el backend exista: this.http.post('api/estudiante/ayudantias/postulaciones', this.postulacion)
  }
}
