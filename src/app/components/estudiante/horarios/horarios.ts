import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.html'
})
export class HorariosComponent {
  // Datos fijos
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  alturaCelda = 60; // px
  anchoColumna = 120; // px
  anchoTiempo = 56; // px

  // Simulación de roles
  rol: 'estudiante' | 'ayudante' = 'estudiante';
  canEdit = this.rol !== 'estudiante';

  // Simulación: ID del docente logueado (para filtrar en ayudante)
  docenteIdLogueado = 1;

  // Materias (para la leyenda)
  materias = [
    { id: 1, nombre: 'Cálculo Avanzado', color: 'bg-blue-100', borde: 'border-blue-300', texto: 'text-blue-700', dot: 'bg-blue-500' },
    { id: 2, nombre: 'Mecánica Cuántica', color: 'bg-emerald-100', borde: 'border-emerald-300', texto: 'text-emerald-700', dot: 'bg-emerald-500' },
    { id: 3, nombre: 'Redes Neuronales', color: 'bg-purple-100', borde: 'border-purple-300', texto: 'text-purple-700', dot: 'bg-purple-500' }
  ];

  // Horarios (con docenteId añadido)
  horarios = [
    { id: 1, dia: 'Lunes', materiaId: 1, horaInicio: '10:00', horaFin: '12:00', tipo: 'virtual', plataforma: 'Zoom', link: 'https://zoom.us/j/123', docenteId: 1 },
    { id: 2, dia: 'Miércoles', materiaId: 2, horaInicio: '08:00', horaFin: '10:00', tipo: 'presencial', aula: 'Aula 301', edificio: 'Edificio de Ciencias', piso: '3', docenteId: 2 },
    { id: 3, dia: 'Viernes', materiaId: 3, horaInicio: '14:00', horaFin: '16:00', tipo: 'virtual', plataforma: 'Meet', link: 'https://meet.google.com/abc', docenteId: 1 }
  ];

  // Estado para el modal de detalles
  claseSeleccionada: any = null;

  // Estado para el formulario de añadir clase
  showAddForm = false;
  newClase: any = {
    materiaId: 1,
    dia: 'Lunes',
    horaInicio: '08:00',
    horaFin: '10:00',
    tipo: 'presencial',
    plataforma: '',
    link: '',
    edificio: '',
    aula: '',
    piso: ''
  };

  // Helpers de posición
  getTop(horaInicio: string): number {
    const index = this.horas.indexOf(horaInicio);
    return index * this.alturaCelda;
  }

  getHeight(horaInicio: string, horaFin: string): number {
    const inicio = this.horas.indexOf(horaInicio);
    const fin = this.horas.indexOf(horaFin);
    return (fin - inicio) * this.alturaCelda - 4;
  }

  // Obtener color de la materia
  getColor(materiaId: number) {
    return this.materias.find(m => m.id === materiaId);
  }

  // Filtrar horarios por día y por rol
  getClasesPorDia(dia: string) {
    let clases = this.horarios.filter(c => c.dia === dia);
    if (this.rol === 'ayudante') {
      clases = clases.filter(c => c.docenteId === this.docenteIdLogueado);
    }
    return clases;
  }

  // Abrir modal de detalles
  abrirDetalle(clase: any) {
    this.claseSeleccionada = clase;
  }

  cerrarDetalle() {
    this.claseSeleccionada = null;
  }

  // Guardar nueva clase
  guardarClase() {
    const nuevaClase = { ...this.newClase, id: Date.now(), docenteId: this.docenteIdLogueado };
    this.horarios.push(nuevaClase);
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm() {
    this.newClase = {
      materiaId: 1,
      dia: 'Lunes',
      horaInicio: '08:00',
      horaFin: '10:00',
      tipo: 'presencial',
      plataforma: '',
      link: '',
      edificio: '',
      aula: '',
      piso: ''
    };
  }
}
