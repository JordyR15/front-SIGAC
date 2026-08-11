import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bitacora.html'
})
export class BitacoraComponent {
  // Mock: Lista de ayudantías activas del estudiante
  ayudantias = [
    { id: 1, nombre: 'Ayudantía - Cálculo Avanzado' },
    { id: 2, nombre: 'Ayudantía - Mecánica Cuántica' }
  ];

  // DTO que se enviará al backend (RegistroBitacoraDto)
  registro = {
    ayudantiaId: 0,
    actividadesRealizadas: '',
    evidenciaUrl: ''
  };

  registrarBitacora() {
    console.log('Registrando bitácora:', this.registro);
    // Cuando el backend exista: this.http.post('api/estudiante/ayudantias/bitacora', this.registro)
  }
}
