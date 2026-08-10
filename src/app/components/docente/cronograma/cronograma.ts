import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cronograma.html',
  styleUrls: ['./cronograma.css']
})
export class CronogramaComponent {
  actividad = {
    id: 0,
    catedraId: 0,
    descripcion: '',
    fechaPrevista: '',
    fechaReal: ''
  };

  guardarCambios() {
    console.log('Guardando cambios del cronograma:', this.actividad);
  }
}
