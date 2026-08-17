import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.html'
})
export class GestionEstudiantesComponent {
  // 1. Obtenemos el rol y el ID del usuario logueado
  rol = localStorage.getItem('rol') || 'Estudiante';
  docenteIdLogueado = 1; // Simulación (en el futuro vendrá del token)

  // 2. Lista completa de materias (base de datos simulada)
  materiasDB = [
    { id: 101, nombre: 'Cálculo Avanzado', codigo: 'MAT-301', docenteResponsableId: 1 },
    { id: 102, nombre: 'Mecánica Cuántica', codigo: 'FIS-401', docenteResponsableId: 2 },
    { id: 103, nombre: 'Redes Neuronales', codigo: 'CMP-501', docenteResponsableId: 1 }
  ];

  // 3. Materias visibles según el rol
  materias = this.materiasDB;

  // 4. Materia seleccionada y lista de estudiantes
  materiaSeleccionadaId: number = 0;
  estudiantesSeleccionados: { id: number; nombre: string; correo: string }[] = [];

  // 5. Buscador de estudiantes
  correoBusqueda: string = '';

  // Simulación: base de datos de estudiantes
  estudiantesDB = [
    { id: 1, nombre: 'Alejandro García', correo: 'a.garcia@institucion.edu' },
    { id: 2, nombre: 'María López', correo: 'm.lopez@institucion.edu' },
    { id: 3, nombre: 'Carlos Ruiz', correo: 'c.ruiz@institucion.edu' },
    { id: 4, nombre: 'Ana Torres', correo: 'a.torres@institucion.edu' }
  ];

  constructor() {
    // Si es Docente, filtrar solo sus materias
    if (this.rol === 'Docente') {
      this.materias = this.materiasDB.filter(m => m.docenteResponsableId === this.docenteIdLogueado);
    }
  }

  buscarYAgregarEstudiante() {
    if (!this.correoBusqueda.trim()) return;
    const estudiante = this.estudiantesDB.find(e => e.correo === this.correoBusqueda);
    if (estudiante) {
      if (!this.estudiantesSeleccionados.some(e => e.id === estudiante.id)) {
        this.estudiantesSeleccionados.push(estudiante);
        this.correoBusqueda = '';
      } else {
        alert('El estudiante ya está en la lista.');
      }
    } else {
      alert('No se encontró ningún estudiante con ese correo.');
    }
  }

  eliminarEstudiante(id: number) {
    this.estudiantesSeleccionados = this.estudiantesSeleccionados.filter(e => e.id !== id);
  }

  guardarEstudiantes() {
    if (this.materiaSeleccionadaId === 0) {
      alert('Por favor, selecciona una materia.');
      return;
    }
    console.log(`Guardando ${this.estudiantesSeleccionados.length} estudiantes en la materia ${this.materiaSeleccionadaId}`);
    alert('Estudiantes añadidos exitosamente a la materia.');
  }
}
