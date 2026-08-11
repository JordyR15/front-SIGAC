import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-sidebar.html'
})
export class RightSidebarComponent {
  // Datos mock para la agenda (Entregas)
  entregas = [
    { titulo: 'Proyecto Redes', descripcion: 'Finalización de arquitectura', tiempo: 'En 2 horas', color: 'amber-500' },
    { titulo: 'Laboratorio Física', descripcion: 'Reporte de práctica #4', tiempo: 'Mañana', color: 'accent' }
  ];

  // Datos mock para los comunicados
  comunicados = [
    {
      titulo: 'Semana de Innovación 2024',
      descripcion: 'Participa en los talleres de IA y Computación.',
      imagen: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_f12a272c27_7e9b51c1eba3044d.png'
    }
  ];
}
