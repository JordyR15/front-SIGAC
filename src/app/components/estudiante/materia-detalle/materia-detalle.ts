import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './materia-detalle.html'
})
export class MateriaDetalleComponent implements OnInit {
  materiaId: number = 0;

  indiceTemaActual: number = 0;

  tabActual: 'recursos' | 'actividades' | 'asistencia' = 'recursos';

  // Leemos el rol del localStorage
  esAyudante: boolean = localStorage.getItem('rol') === 'Ayudante';
  canEdit = this.esAyudante;

  // Simulación de datos de la materia
  materia = {
    id: 0,
    nombre: 'Cálculo Avanzado',
    docente: 'Dra. Evelyn Vance',
    codigo: 'MAT-301',
    estudiantes: 25,
    creditos: 4,
    semana: 8,
    totalSemanas: 16
  };

  // ✅ CREAMOS EL ARRAY 'temas' AQUÍ (con los recursos que ya tenías)
  temas = [
    {
      nombre: 'Tema 1: Introducción al Cálculo',
      recursos: [
        { id: 1, nombre: 'Guía de Estudio - Tema 1', tipo: 'PDF', esencial: true, visto: false },
        { id: 2, nombre: 'Video Explicativo', tipo: 'Video', esencial: false, visto: false },
        { id: 3, nombre: 'Simulador de Integrales', tipo: 'Enlace', esencial: true, visto: false }
      ]
    },
    {
      nombre: 'Tema 2: Integrales Múltiples',
      recursos: [
        { id: 4, nombre: 'Ejercicios Resueltos', tipo: 'PDF', esencial: false, visto: false }
      ]
    }
  ];

  // Actividades
  actividades = [
    { id: 1, nombre: 'Tarea 1', tipo: 'Tarea', fechaEntrega: '2026-08-20', estado: 'pendiente', descripcion: 'Resolver ejercicios del capítulo 3' },
    { id: 2, nombre: 'Quiz 1', tipo: 'Quiz', fechaEntrega: '2026-08-15', estado: 'calificado', nota: 4.5 },
    { id: 3, nombre: 'Proyecto Final', tipo: 'Proyecto', fechaEntrega: '2026-09-10', estado: 'pendiente', descripcion: 'Desarrollar una API REST' }
  ];

  // Asistencia
  registrosAsistencia = [
    {
      fecha: '2026-08-11',
      tema: 'Introducción al Cálculo',
      asistentes: [
        { nombre: 'Alejandro García', email: 'a.garcia@uni.edu', presente: true },
        { nombre: 'María López', email: 'm.lopez@uni.edu', presente: false },
        { nombre: 'Carlos Ruiz', email: 'c.ruiz@uni.edu', presente: true }
      ]
    }
  ];

  // Formularios
  showAddRecurso = false;
  showAddActividad = false;
  showAddClase = false;
  newClaseTema = '';

  nuevoRecurso = { nombre: '', tipo: 'PDF', esencial: false };
  nuevaActividad = { nombre: '', tipo: 'Taller', fechaEntrega: '', descripcion: '' };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.materiaId = +params['id'];
      // ✅ Inicializamos el índice en el último tema
      this.indiceTemaActual = this.temas.length - 1;
    });
  }

  // Navegación entre temas
  irAlTemaAnterior() {
    if (this.indiceTemaActual > 0) {
      this.indiceTemaActual--;
    }
  }

  irAlTemaSiguiente() {
    if (this.indiceTemaActual < this.temas.length - 1) {
      this.indiceTemaActual++;
    }
  }

  toggleVisto(id: number) {
    // Actualizamos el recurso dentro del tema actual
    const tema = this.temas[this.indiceTemaActual];
    tema.recursos = tema.recursos.map(r => r.id === id ? { ...r, visto: !r.visto } : r);
  }

  toggleEsencial(id: number) {
    // Actualizamos el recurso dentro del tema actual
    const tema = this.temas[this.indiceTemaActual];
    tema.recursos = tema.recursos.map(r => r.id === id ? { ...r, esencial: !r.esencial } : r);
  }

  toggleAsistencia(registroIndex: number, estudianteIndex: number) {
    const reg = this.registrosAsistencia[registroIndex];
    reg.asistentes[estudianteIndex].presente = !reg.asistentes[estudianteIndex].presente;
  }

  agregarClase() {
    if (!this.newClaseTema.trim()) return;
    const hoy = new Date().toISOString().split('T')[0];
    this.registrosAsistencia.unshift({
      fecha: hoy,
      tema: this.newClaseTema,
      asistentes: [
        { nombre: 'Alejandro García', email: 'a.garcia@uni.edu', presente: false },
        { nombre: 'María López', email: 'm.lopez@uni.edu', presente: false },
        { nombre: 'Carlos Ruiz', email: 'c.ruiz@uni.edu', presente: false }
      ]
    });
    this.newClaseTema = '';
    this.showAddClase = false;
  }

  agregarRecurso() {
    if (!this.nuevoRecurso.nombre.trim()) return;
    // Agregamos el recurso al tema actual
    const tema = this.temas[this.indiceTemaActual];
    tema.recursos.push({
      id: Date.now(),
      nombre: this.nuevoRecurso.nombre,
      tipo: this.nuevoRecurso.tipo,
      esencial: this.nuevoRecurso.esencial,
      visto: false
    });
    this.nuevoRecurso = { nombre: '', tipo: 'PDF', esencial: false };
    this.showAddRecurso = false;
  }

  agregarActividad() {
    if (!this.nuevaActividad.nombre.trim() || !this.nuevaActividad.fechaEntrega) return;
    this.actividades.push({
      id: Date.now(),
      nombre: this.nuevaActividad.nombre,
      tipo: this.nuevaActividad.tipo,
      fechaEntrega: this.nuevaActividad.fechaEntrega,
      estado: 'pendiente',
      descripcion: this.nuevaActividad.descripcion
    });
    this.nuevaActividad = { nombre: '', tipo: 'Taller', fechaEntrega: '', descripcion: '' };
    this.showAddActividad = false;
  }

  // Helper para contar asistentes presentes
  contarPresentes(asistentes: any[]): number {
    return asistentes.filter(a => a.presente).length;
  }

  // Helper para formatear fecha
  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
