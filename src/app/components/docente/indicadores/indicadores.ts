import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indicadores.html'
})
export class IndicadoresComponent {
  // Alineado con IndicadorCualitativoDto
  indicador = {
    estudianteId: 1,
    catedraId: 101,
    indicador: '',
    observacion: '',
    fecha: new Date().toISOString().split('T')[0]
  };

  registrar() {
    console.log('Registrando indicador:', this.indicador);
  }
}
