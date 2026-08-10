import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoreo.html'
})
export class MonitoreoComponent {
  // Alineado con MonitoreoAyudantiaDto
  monitoreo = {
    ayudantiaId: 1,
    nombreAyudante: 'Ana López',
    planificacion: [
      { id: 1, descripcion: 'Clase de Repaso: Integrales', fechaPlanificada: '2026-08-15', completada: false },
      { id: 2, descripcion: 'Ayuda con Ejercicios', fechaPlanificada: '2026-08-18', completada: true }
    ],
    bitacoras: [
      { id: 1, fecha: '2026-08-15', actividadesRealizadas: 'Sesión de repaso 2h', evidenciaUrl: '#' },
      { id: 2, fecha: '2026-08-12', actividadesRealizadas: 'Tutoría 1h', evidenciaUrl: '#' }
    ]
  };
}
