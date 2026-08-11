import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-sidebar.html'
})
export class RightSidebarComponent {
  // Mock de Tareas Pendientes (basado en ActividadDto)
  tareasPendientes = [
    { titulo: 'Proyecto Redes', descripcion: 'Finalización de arquitectura', fechaEntrega: '2026-08-12', color: 'amber-500' }
  ];

  // Mock de Recursos Esenciales (basado en RecursoDto)
  recursosEsenciales = [
    { id: 1, titulo: 'Guía de Estudio - Cálculo', descripcion: 'Documento base para el examen', visto: false }
  ];

  // Mock de Próximas Clases (basado en ClaseSesionDto)
  proximasClases = [
    { titulo: 'Clase Virtual - Cálculo', link: 'https://zoom.us/...', app: 'Zoom', fecha: '2026-08-11 10:00' }
  ];

  marcarComoVisto(id: number) {
    console.log('Marcando recurso como visto:', id);
    // Conexión futura: POST api/materia/recursos/marcar-visto
    this.recursosEsenciales = this.recursosEsenciales.map(r =>
      r.id === id ? { ...r, visto: true } : r
    );
  }
}
