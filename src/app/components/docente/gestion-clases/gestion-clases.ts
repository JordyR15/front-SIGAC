import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definimos una interfaz para las clases (alineada con ClaseSesionDto)
interface ClaseCreada {
  id: number;
  materiaId: number;
  nombreMateria: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoClase: string;
  // Virtual
  linkVirtual?: string;
  aplicacionVirtual?: string;
  // Presencial
  edificioPresencial?: string;
  aulaPresencial?: string;
  pisoPresencial?: string;
  // Estudiantes
  estudiantes: { id: number; nombre: string; presente: boolean }[];
}

@Component({
  selector: 'app-gestion-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-clases.html'
})
export class GestionClasesComponent {
  // 1. Datos del formulario para crear una nueva clase (CreateClaseSesionDto)
  nuevaClase = {
    materiaId: 0,
    claseId: null as number | null,
    docenteId: 1,
    fecha: '',
    horaInicio: '',
    horaFin: '',
    tipoClase: 'Virtual' as 'Virtual' | 'Presencial',
    linkVirtual: '',
    aplicacionVirtual: '',
    edificioPresencial: '',
    aulaPresencial: '',
    pisoPresencial: ''
  };

  // 2. Lista de materias simuladas
  materias = [
    { id: 101, nombre: 'Cálculo Avanzado' },
    { id: 102, nombre: 'Mecánica Cuántica' },
    { id: 103, nombre: 'Redes Neuronales' }
  ];

  // 3. Lista de clases ya creadas (tipada con ClaseCreada)
  clasesCreadas: ClaseCreada[] = [
    {
      id: 1,
      materiaId: 101,
      nombreMateria: 'Cálculo Avanzado',
      fecha: '2026-08-20',
      horaInicio: '10:00',
      horaFin: '12:00',
      tipoClase: 'Virtual',
      linkVirtual: 'https://zoom.us/j/123',
      aplicacionVirtual: 'Zoom',
      estudiantes: [
        { id: 1, nombre: 'Alejandro García', presente: false },
        { id: 2, nombre: 'María López', presente: false }
      ]
    },
    {
      id: 2,
      materiaId: 102,
      nombreMateria: 'Mecánica Cuántica',
      fecha: '2026-08-22',
      horaInicio: '08:00',
      horaFin: '10:00',
      tipoClase: 'Presencial',
      edificioPresencial: 'Edificio de Ciencias',
      aulaPresencial: 'Aula 301',
      pisoPresencial: '3er Piso',
      estudiantes: [
        { id: 1, nombre: 'Alejandro García', presente: false }
      ]
    }
  ];

  // Variable para controlar qué clase tiene el modal de asistencia abierto
  claseAsistenciaId: number | null = null;

  // Método para guardar la nueva clase
  guardarClase() {
    console.log('Creando nueva clase con los datos:', this.nuevaClase);

    // Construimos el objeto de la nueva clase basándonos en el tipo
    const nuevaClaseObj: ClaseCreada = {
      id: Date.now(),
      materiaId: this.nuevaClase.materiaId,
      nombreMateria: this.materias.find(m => m.id === this.nuevaClase.materiaId)?.nombre || 'Materia',
      fecha: this.nuevaClase.fecha,
      horaInicio: this.nuevaClase.horaInicio,
      horaFin: this.nuevaClase.horaFin,
      tipoClase: this.nuevaClase.tipoClase,
      estudiantes: this.clasesCreadas[0]?.estudiantes || []
    };

    // Asignamos los campos específicos según el tipo de clase
    if (this.nuevaClase.tipoClase === 'Virtual') {
      nuevaClaseObj.linkVirtual = this.nuevaClase.linkVirtual;
      nuevaClaseObj.aplicacionVirtual = this.nuevaClase.aplicacionVirtual;
    } else {
      nuevaClaseObj.edificioPresencial = this.nuevaClase.edificioPresencial;
      nuevaClaseObj.aulaPresencial = this.nuevaClase.aulaPresencial;
      nuevaClaseObj.pisoPresencial = this.nuevaClase.pisoPresencial;
    }

    // Agregamos la nueva clase al array
    this.clasesCreadas.push(nuevaClaseObj);

    // Resetear formulario
    this.nuevaClase = {
      materiaId: 0,
      claseId: null,
      docenteId: 1,
      fecha: '',
      horaInicio: '',
      horaFin: '',
      tipoClase: 'Virtual',
      linkVirtual: '',
      aplicacionVirtual: '',
      edificioPresencial: '',
      aulaPresencial: '',
      pisoPresencial: ''
    };
  }

  // Método para abrir el modal de asistencia
  abrirAsistencia(claseId: number) {
    this.claseAsistenciaId = claseId;
  }

  // Método para cerrar el modal de asistencia
  cerrarAsistencia() {
    this.claseAsistenciaId = null;
  }

  // Método para alternar el estado de presente/ausente de un estudiante
  toggleAsistencia(claseId: number, estudianteId: number) {
    const clase = this.clasesCreadas.find(c => c.id === claseId);
    if (clase) {
      const estudiante = clase.estudiantes.find(e => e.id === estudianteId);
      if (estudiante) {
        estudiante.presente = !estudiante.presente;
        console.log(`Estudiante ${estudiante.nombre} ahora está ${estudiante.presente ? 'Presente' : 'Ausente'}`);
      }
    }
  }

  // Método auxiliar para obtener una clase por su ID
  // Método auxiliar para obtener una clase por su ID
  getClaseById(id: number) {
    const clase = this.clasesCreadas.find(c => c.id === id);
    // Si no encuentra la clase, devolvemos un objeto "fantasma" con estudiantes vacío
    if (!clase) {
      return {
        id: 0,
        materiaId: 0,
        nombreMateria: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        tipoClase: '',
        estudiantes: [] // <-- ESTO ES LO QUE ELIMINA EL ERROR
      };
    }
    return clase;
  }
  // Método para contar estudiantes presentes
  contarPresentes(clase: any): number {
    if (!clase || !clase.estudiantes) return 0;
    return clase.estudiantes.filter((e: any) => e.presente).length;
  }

  // Método para contar el total de estudiantes
  contarTotal(clase: any): number {
    if (!clase || !clase.estudiantes) return 0;
    return clase.estudiantes.length;
  }
}
