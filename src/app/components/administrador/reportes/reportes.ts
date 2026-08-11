import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html'
})
export class ReportesComponent {
  // Mock basado en el GroupBy del backend (devuelve { Estado, Cantidad })
  reporte = [
    { estado: 'Activa', cantidad: 5 },
    { estado: 'Pendiente', cantidad: 3 },
    { estado: 'Finalizada', cantidad: 2 }
  ];

  total = 10;

  generarReporte() {
    console.log('Generando reporte administrativo...');
    // Conexión futura: GET api/coordinador/ayudantias/reportes-administrativos
  }
}
