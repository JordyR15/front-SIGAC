import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios.html'
})
export class HorariosComponent {
  // Datos de la semana
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  alturaCelda = 60; // px

  // Materias con colores
  materias = [
    { id: 1, nombre: 'Cálculo Avanzado', color: 'bg-blue-100', borde: 'border-blue-300', texto: 'text-blue-700' },
    { id: 2, nombre: 'Mecánica Cuántica', color: 'bg-emerald-100', borde: 'border-emerald-300', texto: 'text-emerald-700' },
    { id: 3, nombre: 'Redes Neuronales', color: 'bg-purple-100', borde: 'border-purple-300', texto: 'text-purple-700' }
  ];

  // Clases programadas
  horarios = [
    { id: 1, dia: 'Lunes', materiaId: 1, horaInicio: '10:00', horaFin: '12:00', tipo: 'virtual', plataforma: 'Zoom', link: 'https://zoom.us/j/123' },
    { id: 2, dia: 'Miércoles', materiaId: 2, horaInicio: '08:00', horaFin: '10:00', tipo: 'presencial', aula: 'Aula 301', edificio: 'Edificio de Ciencias' },
    { id: 3, dia: 'Viernes', materiaId: 3, horaInicio: '14:00', horaFin: '16:00', tipo: 'virtual', plataforma: 'Meet', link: 'https://meet.google.com/abc' }
  ];

  // ✅ NUEVO MÉTODO: Devuelve las clases filtradas por día
  getClasesPorDia(dia: string) {
    return this.horarios.filter(clase => clase.dia === dia);
  }

  // Helper para calcular la posición top
  getTop(horaInicio: string): number {
    const index = this.horas.indexOf(horaInicio);
    return index * this.alturaCelda;
  }

  // Helper para calcular la altura
  getHeight(horaInicio: string, horaFin: string): number {
    const inicio = this.horas.indexOf(horaInicio);
    const fin = this.horas.indexOf(horaFin);
    return (fin - inicio) * this.alturaCelda - 4;
  }

  // Obtener color de la materia
  getColor(materiaId: number) {
    return this.materias.find(m => m.id === materiaId);
  }
}
