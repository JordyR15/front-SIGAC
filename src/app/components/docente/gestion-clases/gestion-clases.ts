import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Definimos una interfaz para las clases
interface ClaseCreada {
  id: number;
  materiaId: number;
  nombreMateria: string;
  dias: string[];        // <-- AHORA GUARDAMOS UN ARRAY DE DÍAS
  fecha?: string;        // Opcional si es un solo día
  horaInicio: string;
  horaFin: string;
  tipoClase: string;
  linkVirtual?: string;
  aplicacionVirtual?: string;
  edificioPresencial?: string;
  aulaPresencial?: string;
  pisoPresencial?: string;
  estudiantes: { id: number; nombre: string; presente: boolean }[];
}

@Component({
  selector: 'app-gestion-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-clases.html'
})
export class GestionClasesComponent implements OnInit {
  nuevaClase = {
    materiaId: 0,
    claseId: null as number | null,
    docenteId: 1,
    diasSeleccionados: [] as string[], // <-- NUEVO: Array de días seleccionados
    fecha: '', // <-- Opcional
    horaInicio: '',
    horaFin: '',
    tipoClase: 'Virtual' as 'Virtual' | 'Presencial',
    linkVirtual: '',
    aplicacionVirtual: '',
    edificioPresencial: '',
    aulaPresencial: '',
    pisoPresencial: ''
  };

  materias = [
    { id: 101, nombre: 'Cálculo Avanzado', docenteId: 1 }, // El ayudante/docente con ID 1
    { id: 102, nombre: 'Mecánica Cuántica', docenteId: 2 }, // Otro docente
    { id: 103, nombre: 'Redes Neuronales', docenteId: 1 }  // El ayudante/docente con ID 1
  ];

  clasesCreadas: ClaseCreada[] = [];

  // Control del modal de asistencia
  claseAsistenciaId: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const docenteIdLogueado = 1;

    // Filtrar las materias para que solo muestre las que dicta este docente
    this.materias = this.materias.filter(m => m.docenteId === docenteIdLogueado);

    // Leer los query params (el resto del código sigue igual)
    this.route.queryParams.subscribe(params => {
      // Leer los días (vienen como string separado por comas)
      if (params['dias']) {
        this.nuevaClase.diasSeleccionados = params['dias'].split(',');
      }

      // Leer las horas
      if (params['horaInicio'] && params['horaFin']) {
        this.nuevaClase.horaInicio = params['horaInicio'];
        this.nuevaClase.horaFin = params['horaFin'];
      }

      // Seleccionar la primera materia por defecto si hay
      if (this.materias.length > 0) {
        this.nuevaClase.materiaId = this.materias[0].id;
      }
    });
  }

  // Método para alternar la selección de días (checkboxes)
  toggleDia(event: any) {
    const dia = event.target.value;
    if (event.target.checked) {
      if (!this.nuevaClase.diasSeleccionados.includes(dia)) {
        this.nuevaClase.diasSeleccionados.push(dia);
      }
    } else {
      this.nuevaClase.diasSeleccionados = this.nuevaClase.diasSeleccionados.filter(d => d !== dia);
    }
  }

  // Guardar la nueva clase
  guardarClase() {
    if (this.nuevaClase.diasSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un día de la semana.');
      return;
    }

    console.log('Creando clase:', this.nuevaClase);
    // Aquí iría el llamado al backend

    // Simulación de guardado exitoso
    this.clasesCreadas.push({
      id: Date.now(),
      materiaId: this.nuevaClase.materiaId,
      nombreMateria: this.materias.find(m => m.id === this.nuevaClase.materiaId)?.nombre || 'Materia',
      dias: [...this.nuevaClase.diasSeleccionados],
      fecha: this.nuevaClase.fecha || undefined,
      horaInicio: this.nuevaClase.horaInicio,
      horaFin: this.nuevaClase.horaFin,
      tipoClase: this.nuevaClase.tipoClase,
      linkVirtual: this.nuevaClase.linkVirtual,
      aplicacionVirtual: this.nuevaClase.aplicacionVirtual,
      edificioPresencial: this.nuevaClase.edificioPresencial,
      aulaPresencial: this.nuevaClase.aulaPresencial,
      pisoPresencial: this.nuevaClase.pisoPresencial,
      estudiantes: [
        { id: 1, nombre: 'Alejandro García', presente: false },
        { id: 2, nombre: 'María López', presente: false }
      ]
    });

    // Resetear formulario
    this.nuevaClase = {
      materiaId: 0,
      claseId: null,
      docenteId: 1,
      diasSeleccionados: [],
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

  // --- MÉTODOS PARA EL MODAL DE ASISTENCIA ---

  abrirAsistencia(claseId: number) {
    this.claseAsistenciaId = claseId;
    const clase = this.clasesCreadas.find(c => c.id === claseId);
    if (clase) {
      // Marcar a todos como presentes al abrir el modal
      clase.estudiantes = clase.estudiantes.map(e => ({ ...e, presente: true }));
    }
  }

  cerrarAsistencia() {
    this.claseAsistenciaId = null;
  }

  toggleAsistencia(claseId: number, estudianteId: number) {
    const clase = this.clasesCreadas.find(c => c.id === claseId);
    if (clase) {
      const estudiante = clase.estudiantes.find(e => e.id === estudianteId);
      if (estudiante) {
        estudiante.presente = !estudiante.presente;
      }
    }
  }

  // --- MÉTODOS AUXILIARES ---

  getClaseById(id: number): ClaseCreada | undefined {
    return this.clasesCreadas.find(c => c.id === id);
  }

  contarPresentes(clase: any): number {
    if (!clase || !clase.estudiantes) return 0;
    return clase.estudiantes.filter((e: any) => e.presente).length;
  }

  contarTotal(clase: any): number {
    if (!clase || !clase.estudiantes) return 0;
    return clase.estudiantes.length;
  }

  calcularPorcentajeAsistencia(estudianteId: number, materiaId: number): string {
    const clasesDeMateria = this.clasesCreadas.filter(c => c.materiaId === materiaId);
    if (clasesDeMateria.length === 0) return '0%';

    let presentes = 0;
    for (const clase of clasesDeMateria) {
      const estudiante = clase.estudiantes.find(e => e.id === estudianteId);
      if (estudiante && estudiante.presente) {
        presentes++;
      }
    }
    return Math.round((presentes / clasesDeMateria.length) * 100) + '%';
  }

  // Exponer Math para usarlo en el HTML
  Math = Math;
}
