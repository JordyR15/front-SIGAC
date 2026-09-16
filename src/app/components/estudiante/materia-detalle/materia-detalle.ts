import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MateriaService, MateriaDto, RecursoDto, ActividadDto, RegistroAsistenciaDto } from '../../../services/materia.service';
import { DocumentosDescargaService } from '../../../services/documentos-descarga.service';
import {
  EstudianteService,
  EvaluacionDiagnosticaEstudianteDto,
  PreguntaCuestionarioDiagnosticoDto,
  RespuestaCuestionarioDiagnosticoDto
} from '../../../services/estudiante.service';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './materia-detalle.html'
})
export class MateriaDetalleComponent implements OnInit, OnDestroy {
  materiaId: number = 0;
  indiceTemaActual: number = 0;
  tabActual: 'recursos' | 'actividades' | 'diagnostico' | 'asistencia' = 'recursos';

  rol: string = 'Estudiante';
  esAyudante: boolean = false;
  esDocente: boolean = false;
  esAdmin: boolean = false;
  canEdit: boolean = false;

  materia: MateriaDto = {
    id: 101,
    nombre: 'CÃ¡lculo Avanzado',
    codigo: 'MAT-301',
    descripcion: 'Derivadas parciales e integrales mÃºltiples.',
    docente: 'Dra. Evelyn Vance',
    creditos: 4,
    semana: 8,
    totalSemanas: 16,
    estudiantes: []
  };

  temas: string[] = ['Tema 1: Fundamentos y Conceptos Iniciales'];
  recursosDeMateria: RecursoDto[] = [];
  actividadesDeMateria: ActividadDto[] = [];
  registrosAsistencia: RegistroAsistenciaDto[] = [];

  // =========================================================
  // RF-004 - EVALUACIÓN DIAGNÓSTICA DEL ESTUDIANTE
  // =========================================================
  evaluacionesDiagnosticas: EvaluacionDiagnosticaEstudianteDto[] = [];
  evaluacionDiagnosticaSeleccionada: EvaluacionDiagnosticaEstudianteDto | null = null;
  preguntasDiagnostico: PreguntaCuestionarioDiagnosticoDto[] = [];
  respuestasDiagnostico: Record<number, string> = {};
  archivoDiagnostico: File | null = null;

  cargandoDiagnosticos = false;
  guardandoDiagnostico = false;
  modalDiagnostico = false;

  errorDiagnostico = '';
  mensajeDiagnostico = '';

  showAddRecurso = false;
  showAddActividad = false;
  showAddClase = false;
  showAddTema = false;

  newTemaNombre = '';
  newClaseTema = '';

  nuevoRecurso = {
    nombre: '',
    tipo: 'PDF',
    esencial: false,
    url: 'https://ejemplo.edu/recurso.pdf',
    descripcion: '',
    temaNombre: '',
    // Texto para enlaces adicionales (uno por lÃ­nea o separados por comas)
    linksString: ''
  };

  // Archivo temporal seleccionado por el usuario (si carga localmente)
  archivoRecurso: { nombre: string; tamanoKb: number; dataUrl: string; storageKey?: string } | null = null;

  nuevaActividad = {
    nombre: '',
    tipo: 'Taller',
    fechaEntrega: '',
    descripcion: ''
  };

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materiaService: MateriaService,
    private descargaService: DocumentosDescargaService,
    private estudianteService: EstudianteService
  ) {}

  ngOnInit() {
    this.detectarRol();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.materiaId = Number(params['id']);
      } else {
        this.materiaId = 101;
      }
      this.cargarDatosMateria();

      if (this.rol === 'Estudiante') {
        this.cargarEvaluacionesDiagnosticas();
      }
    });

    // Suscribirse a cambios en recursos
    this.subs.push(
      this.materiaService.recursos$.subscribe(allRecursos => {
        this.recursosDeMateria = allRecursos.filter(r => Number(r.materiaId) === Number(this.materiaId));
      })
    );

    // Suscribirse a cambios en actividades
    this.subs.push(
      this.materiaService.actividades$.subscribe(allActs => {
        this.actividadesDeMateria = allActs.filter(a => Number(a.materiaId) === Number(this.materiaId));
      })
    );

    // Suscribirse a cambios en asistencia
    this.subs.push(
      this.materiaService.asistencias$.subscribe(allAsist => {
        this.registrosAsistencia = allAsist.filter(a => Number(a.materiaId) === Number(this.materiaId));
      })
    );

    // Suscribirse a materias para sincronizar datos del banner
    this.subs.push(
      this.materiaService.materias$.subscribe(() => {
        const found = this.materiaService.getMateriaById(this.materiaId);
        if (found) {
          this.materia = found;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  detectarRol() {
    if (typeof window !== 'undefined') {
      this.rol = localStorage.getItem('rol') || 'Estudiante';
      this.esAyudante = this.rol === 'Ayudante';
      this.esDocente = this.rol === 'Docente';
      this.esAdmin = this.rol === 'Administrador' || this.rol === 'Admin';
      this.canEdit = this.esAyudante || this.esDocente || this.esAdmin;
    }
  }

  cargarDatosMateria() {
    const found = this.materiaService.getMateriaById(this.materiaId);
    if (found) {
      this.materia = found;
    } else {
      this.materia = {
        id: this.materiaId,
        nombre: `Materia #${this.materiaId}`,
        codigo: `MAT-${this.materiaId}`,
        docente: 'Docente Asignado',
        creditos: 4,
        semana: 1,
        totalSemanas: 16,
        estudiantes: []
      };
    }

    this.temas = this.materiaService.getTemasByMateria(this.materiaId);
    if (this.indiceTemaActual >= this.temas.length) {
      this.indiceTemaActual = 0;
    }
    this.nuevoRecurso.temaNombre = this.temas[this.indiceTemaActual] || 'Tema 1: Fundamentos';

    // Cargar listas iniciales
    this.recursosDeMateria = this.materiaService.getRecursosSnapshot().filter(r => Number(r.materiaId) === Number(this.materiaId));
  }

  get temaActualNombre(): string {
    return this.temas[this.indiceTemaActual] || 'Tema Principal';
  }

  get recursosDelTemaActual(): RecursoDto[] {
    const temaActual = this.temaActualNombre;
    return this.recursosDeMateria.filter(r => !r.temaNombre || r.temaNombre === temaActual);
  }

  irAlTemaAnterior() {
    if (this.indiceTemaActual > 0) {
      this.indiceTemaActual--;
      this.nuevoRecurso.temaNombre = this.temaActualNombre;
    }
  }

  irAlTemaSiguiente() {
    if (this.indiceTemaActual < this.temas.length - 1) {
      this.indiceTemaActual++;
      this.nuevoRecurso.temaNombre = this.temaActualNombre;
    }
  }

  seleccionarTema(index: number) {
    this.indiceTemaActual = index;
    this.nuevoRecurso.temaNombre = this.temaActualNombre;
  }

  agregarNuevoTema() {
    if (!this.newTemaNombre.trim()) return;
    this.temas = this.materiaService.addTemaToMateria(this.materiaId, this.newTemaNombre);
    this.indiceTemaActual = this.temas.length - 1;
    this.nuevoRecurso.temaNombre = this.temaActualNombre;
    this.newTemaNombre = '';
    this.showAddTema = false;
  }

  toggleVisto(id?: number) {
    if (!id) return;
    this.materiaService.marcarRecursoComoVisto(id).subscribe();
  }

  toggleEsencial(id?: number) {
    if (!id) return;
    this.materiaService.toggleRecursoEsencial(id);
  }

  eliminarRecurso(id?: number) {
    if (!id) return;
    if (confirm('Â¿EstÃ¡s seguro de eliminar este recurso educativo?')) {
      this.materiaService.deleteRecurso(id);
    }
  }

  agregarRecurso() {
    if (!this.nuevoRecurso.nombre.trim()) return;

    // Parsear links (lÃ­neas o comas)
    const rawLinks = (this.nuevoRecurso as any).linksString || '';
    const links = rawLinks.split(/\r?\n|,/) .map((s: string) => s.trim()).filter(Boolean);

    this.materiaService.addRecurso(this.materiaId, {
      titulo: this.nuevoRecurso.nombre,
      descripcion: this.nuevoRecurso.descripcion || `Recurso de ${this.nuevoRecurso.tipo}`,
      url: this.nuevoRecurso.url || 'https://ejemplo.edu/recurso.pdf',
      tipo: this.nuevoRecurso.tipo,
      esEsencial: this.nuevoRecurso.esencial,
      materiaId: this.materiaId,
      temaNombre: this.nuevoRecurso.temaNombre || this.temaActualNombre,
      nombreArchivo: this.archivoRecurso?.nombre,
      archivoDataUrl: this.archivoRecurso?.dataUrl,
      tamanoArchivoKb: this.archivoRecurso?.tamanoKb,
      links: links
    }).subscribe(() => {
      this.nuevoRecurso = {
        nombre: '',
        tipo: 'PDF',
        esencial: false,
        url: 'https://ejemplo.edu/recurso.pdf',
        descripcion: '',
        temaNombre: this.temaActualNombre,
        linksString: ''
      } as any;
      this.archivoRecurso = null;
      this.showAddRecurso = false;
    });
  }

  onArchivoRecursoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.archivoRecurso = {
        nombre: file.name,
        tamanoKb: Math.round(file.size / 1024),
        dataUrl: reader.result as string
      };
      if (!this.nuevoRecurso.nombre.trim()) {
        this.nuevoRecurso.nombre = file.name.replace(/\.[^/.]+$/, '');
      }
    };
    reader.readAsDataURL(file);

    // Intentar subir al backend y obtener URL pÃºblica
    try {
      this.materiaService.uploadRecurso(this.materiaId, file).subscribe({
        next: (res) => {
          if (res?.url) {
            this.nuevoRecurso.url = res.url;
          }
          if (res?.key) {
            if (this.archivoRecurso) (this.archivoRecurso as any).storageKey = res.key;
          }
        },
        error: () => {
          // backend posiblemente inactivo â€” dejar archivo local
        }
      });
    } catch (e) {
      // noop
    }
  }

  quitarArchivoRecurso(): void {
    this.archivoRecurso = null;
  }

  agregarActividad() {
    if (!this.nuevaActividad.nombre.trim() || !this.nuevaActividad.fechaEntrega) return;

    this.materiaService.addActividad(this.materiaId, {
      titulo: this.nuevaActividad.nombre,
      descripcion: this.nuevaActividad.descripcion || 'Sin descripciÃ³n',
      fechaEntrega: this.nuevaActividad.fechaEntrega,
      tipo: this.nuevaActividad.tipo,
      materiaId: this.materiaId
    }).subscribe(() => {
      this.nuevaActividad = { nombre: '', tipo: 'Taller', fechaEntrega: '', descripcion: '' };
      this.showAddActividad = false;
    });
  }

  marcarActividadEntregada(actividadId: number) {
    this.materiaService.updateActividadEstado(actividadId, 'entregada');
  }

  calificarActividad(actividadId?: number) {
    if (!actividadId) return;
    const rutaBase = this.esAyudante ? '/ayudante' : '/docente';
    this.router.navigate([`${rutaBase}/actividades`, actividadId, 'calificar']);
  }

  eliminarActividad(actividadId?: number) {
    if (!actividadId) return;
    if (confirm('Â¿Deseas eliminar esta actividad del curso?')) {
      this.materiaService.deleteActividad(actividadId);
    }
  }

  agregarClase() {
    if (!this.newClaseTema.trim()) return;
    this.materiaService.addRegistroAsistencia(this.materiaId, this.newClaseTema, this.materia.estudiantes);
    this.newClaseTema = '';
    this.showAddClase = false;
  }

  // =========================================================
  // RF-004 - EVALUACIÓN DIAGNÓSTICA DEL ESTUDIANTE
  // =========================================================

  cargarEvaluacionesDiagnosticas(): void {
    if (this.rol !== 'Estudiante') {
      this.evaluacionesDiagnosticas = [];
      this.cargandoDiagnosticos = false;
      return;
    }

    if (this.cargandoDiagnosticos) {
      return;
    }

    this.cargandoDiagnosticos = true;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';

    this.estudianteService.getEvaluacionesDiagnosticas().subscribe({
      next: (evaluaciones) => {
        const todas = Array.isArray(evaluaciones) ? evaluaciones : [];

        this.evaluacionesDiagnosticas =
          this.filtrarDiagnosticosDeMateria(todas);

        this.cargandoDiagnosticos = false;
      },
      error: (err) => {
        this.cargandoDiagnosticos = false;
        this.evaluacionesDiagnosticas = [];
        this.errorDiagnostico =
          err?.error?.message ||
          'No se pudieron cargar las evaluaciones diagnósticas de esta materia.';
      }
    });
  }

  private filtrarDiagnosticosDeMateria(
    evaluaciones: EvaluacionDiagnosticaEstudianteDto[]
  ): EvaluacionDiagnosticaEstudianteDto[] {
    /*
     * IMPORTANTE:
     * La ruta de materia puede usar el MateriaId real (por ejemplo 22),
     * mientras RF-004 trabaja con CatedraId (por ejemplo 9).
     * Por eso no podemos asumir que materiaId === catedraId.
     */

    const catedraIdMateria =
      Number((this.materia as any)?.catedraId) || 0;

    if (catedraIdMateria > 0) {
      const porCatedraId = evaluaciones.filter(
        evaluacion =>
          Number(evaluacion.catedraId) === catedraIdMateria
      );

      if (porCatedraId.length > 0) {
        return porCatedraId;
      }
    }

    // Compatibilidad con pantallas donde la ruta ya contiene CatedraId.
    const porIdRuta = evaluaciones.filter(
      evaluacion =>
        Number(evaluacion.catedraId) === Number(this.materiaId)
    );

    if (porIdRuta.length > 0) {
      return porIdRuta;
    }

    /*
     * Fallback seguro para el modelo actual:
     * si el detalle está abierto con MateriaId pero el diagnóstico devuelve
     * CatedraId, se relacionan por el nombre real de la asignatura/cátedra.
     */
    const nombreMateria =
      this.normalizarTextoDiagnostico(this.materia?.nombre || '');

    if (!nombreMateria) {
      return [];
    }

    return evaluaciones.filter(evaluacion => {
      const nombreCatedra =
        this.normalizarTextoDiagnostico(evaluacion.catedra || '');

      return nombreCatedra === nombreMateria;
    });
  }

  private normalizarTextoDiagnostico(valor: string): string {
    return (valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  abrirEvaluacionDiagnostica(
    evaluacion: EvaluacionDiagnosticaEstudianteDto
  ): void {
    this.evaluacionDiagnosticaSeleccionada = { ...evaluacion };
    this.archivoDiagnostico = null;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';

    this.preguntasDiagnostico =
      this.estudianteService.parsePreguntasCuestionario(
        evaluacion.preguntasCuestionario
      );

    this.respuestasDiagnostico = {};

    const respuestasGuardadas =
      this.estudianteService.parseRespuestasCuestionario(
        evaluacion.respuestasCuestionario
      );

    respuestasGuardadas.forEach(respuesta => {
      if (respuesta.preguntaId) {
        this.respuestasDiagnostico[respuesta.preguntaId] =
          respuesta.respuesta;
      }
    });

    this.modalDiagnostico = true;
  }

  cerrarEvaluacionDiagnostica(): void {
    if (this.guardandoDiagnostico) {
      return;
    }

    this.modalDiagnostico = false;
    this.evaluacionDiagnosticaSeleccionada = null;
    this.preguntasDiagnostico = [];
    this.respuestasDiagnostico = {};
    this.archivoDiagnostico = null;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';
  }

  onArchivoDiagnosticoChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.archivoDiagnostico = null;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    const extensionesPermitidas = [
      '.pdf',
      '.doc',
      '.docx',
      '.zip',
      '.png',
      '.jpg',
      '.jpeg'
    ];

    const nombre = archivo.name.toLowerCase();
    const extensionValida =
      extensionesPermitidas.some(ext => nombre.endsWith(ext));

    if (!extensionValida) {
      this.errorDiagnostico =
        'Formato no permitido. Usa PDF, Word, ZIP, PNG, JPG o JPEG.';
      input.value = '';
      return;
    }

    this.archivoDiagnostico = archivo;
  }

  quitarArchivoDiagnostico(): void {
    this.archivoDiagnostico = null;
    this.errorDiagnostico = '';
  }

  entregarArchivoDiagnostico(): void {
    const evaluacion = this.evaluacionDiagnosticaSeleccionada;

    if (!evaluacion) {
      return;
    }

    if (evaluacion.tipoEvaluacion !== 'Archivo') {
      this.errorDiagnostico =
        'Esta evaluación diagnóstica no es de tipo Archivo.';
      return;
    }

    if (!evaluacion.puedeRealizar) {
      this.errorDiagnostico =
        'La evaluación diagnóstica no está disponible para realizarse.';
      return;
    }

    if (!this.archivoDiagnostico) {
      this.errorDiagnostico =
        'Selecciona un archivo antes de realizar la entrega.';
      return;
    }

    this.guardandoDiagnostico = true;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';

    this.estudianteService
      .entregarEvaluacionDiagnosticaArchivo(
        evaluacion.evaluacionId,
        this.archivoDiagnostico
      )
      .subscribe({
        next: (respuesta) => {
          this.guardandoDiagnostico = false;
          this.archivoDiagnostico = null;
          this.mensajeDiagnostico =
            respuesta?.message ||
            'Evaluación diagnóstica entregada correctamente.';

          this.actualizarDiagnosticoDespuesDeEntrega(
            evaluacion.evaluacionId
          );
        },
        error: (err) => {
          this.guardandoDiagnostico = false;
          this.errorDiagnostico =
            err?.error?.message ||
            'No se pudo entregar el archivo de la evaluación diagnóstica.';
        }
      });
  }

  entregarCuestionarioDiagnostico(): void {
    const evaluacion = this.evaluacionDiagnosticaSeleccionada;

    if (!evaluacion) {
      return;
    }

    if (evaluacion.tipoEvaluacion !== 'Cuestionario') {
      this.errorDiagnostico =
        'Esta evaluación diagnóstica no es de tipo Cuestionario.';
      return;
    }

    if (!evaluacion.puedeRealizar) {
      this.errorDiagnostico =
        'La evaluación diagnóstica no está disponible para realizarse.';
      return;
    }

    const respuestas: RespuestaCuestionarioDiagnosticoDto[] =
      this.preguntasDiagnostico
        .map(pregunta => ({
          preguntaId: pregunta.id,
          respuesta:
            (this.respuestasDiagnostico[pregunta.id] || '').trim()
        }))
        .filter(respuesta => !!respuesta.respuesta);

    if (respuestas.length === 0) {
      this.errorDiagnostico =
        'Debes responder al menos una pregunta antes de entregar.';
      return;
    }

    this.guardandoDiagnostico = true;
    this.errorDiagnostico = '';
    this.mensajeDiagnostico = '';

    this.estudianteService
      .entregarEvaluacionDiagnosticaCuestionario(
        evaluacion.evaluacionId,
        respuestas
      )
      .subscribe({
        next: (respuesta) => {
          this.guardandoDiagnostico = false;
          this.mensajeDiagnostico =
            respuesta?.message ||
            'Cuestionario diagnóstico entregado correctamente.';

          this.actualizarDiagnosticoDespuesDeEntrega(
            evaluacion.evaluacionId
          );
        },
        error: (err) => {
          this.guardandoDiagnostico = false;
          this.errorDiagnostico =
            err?.error?.message ||
            'No se pudo entregar el cuestionario diagnóstico.';
        }
      });
  }

  private actualizarDiagnosticoDespuesDeEntrega(
    evaluacionId: number
  ): void {
    this.estudianteService.getEvaluacionesDiagnosticas().subscribe({
      next: (evaluaciones) => {
        const todas = Array.isArray(evaluaciones) ? evaluaciones : [];

        this.evaluacionesDiagnosticas =
          this.filtrarDiagnosticosDeMateria(todas);

        const actualizada = this.evaluacionesDiagnosticas.find(
          evaluacion =>
            Number(evaluacion.evaluacionId) === Number(evaluacionId)
        );

        if (actualizada) {
          this.evaluacionDiagnosticaSeleccionada = {
            ...actualizada
          };

          this.preguntasDiagnostico =
            this.estudianteService.parsePreguntasCuestionario(
              actualizada.preguntasCuestionario
            );

          this.respuestasDiagnostico = {};

          this.estudianteService
            .parseRespuestasCuestionario(
              actualizada.respuestasCuestionario
            )
            .forEach(respuesta => {
              if (respuesta.preguntaId) {
                this.respuestasDiagnostico[respuesta.preguntaId] =
                  respuesta.respuesta;
              }
            });
        }
      },
      error: () => {
        // La entrega ya fue guardada. Si falla la recarga, el usuario
        // puede cerrar y volver a abrir la pestaña para actualizar.
      }
    });
  }

  abrirArchivoDiagnostico(url?: string | null): void {
    const archivoUrl =
      this.estudianteService.resolverUrlArchivo(url);

    if (!archivoUrl || typeof window === 'undefined') {
      return;
    }

    window.open(
      archivoUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  formatearFechaHoraDiagnostico(
    fecha?: string | null
  ): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return fecha;
    }

    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  textoDisponibilidadDiagnostico(
    evaluacion: EvaluacionDiagnosticaEstudianteDto
  ): string {
    switch (evaluacion.disponibilidad) {
      case 'Disponible':
        return 'Disponible';
      case 'NoIniciada':
        return 'Próximamente';
      case 'Cerrada':
        return 'Finalizada';
      case 'SinFechas':
        return 'Sin fechas';
      default:
        return evaluacion.disponibilidad || 'Sin estado';
    }
  }

  textoEstadoEntregaDiagnostico(
    evaluacion: EvaluacionDiagnosticaEstudianteDto
  ): string {
    if (evaluacion.estadoEntrega === 'Calificado') {
      return 'Calificado';
    }

    if (evaluacion.estadoEntrega === 'Entregado') {
      return 'Entregado';
    }

    return 'Pendiente';
  }

  Math = Math;
  busquedaEstudianteAsistencia: string = '';
  filtroEstadoAsistencia: 'todos' | 'presentes' | 'ausentes' = 'todos';

  getEstudiantesFiltrados(asistentes: any[]): any[] {
    if (!asistentes) return [];
    let list = asistentes;
    if (this.filtroEstadoAsistencia === 'presentes') {
      list = list.filter(a => a.presente);
    } else if (this.filtroEstadoAsistencia === 'ausentes') {
      list = list.filter(a => !a.presente);
    }
    if (this.busquedaEstudianteAsistencia.trim()) {
      const q = this.busquedaEstudianteAsistencia.toLowerCase().trim();
      list = list.filter(a => a.nombre?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q));
    }
    return list;
  }

  marcarTodosAsistencia(registroId: number, presente: boolean) {
    const reg = this.registrosAsistencia.find(r => r.id === registroId);
    if (!reg || !reg.asistentes) return;
    reg.asistentes.forEach((a, idx) => {
      if (a.presente !== presente) {
        this.materiaService.toggleAsistencia(registroId, idx);
      }
    });
  }

  toggleAsistencia(registroId: number, estudianteIndex: number) {
    this.materiaService.toggleAsistencia(registroId, estudianteIndex);
  }

  contarPresentes(asistentes: any[]): number {
    if (!asistentes) return 0;
    return asistentes.filter(a => a.presente).length;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  descargarRecursoDocumento(r: RecursoDto): void {
    if (r.archivoDataUrl) {
      this.descargaService.descargarArchivo(r.nombreArchivo || `${r.titulo}.pdf`, r.archivoDataUrl);
      return;
    }
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${r.titulo} - UTEQ</title>
<style>body{font-family:sans-serif;padding:30px;line-height:1.6;color:#1e293b;}</style>
</head>
<body>
  <div style="border-bottom:2px solid #047857;padding-bottom:10px;margin-bottom:20px;">
    <h2 style="color:#065f46;margin:0;">Universidad TÃ©cnica Estatal de Quevedo (UTEQ)</h2>
    <h4 style="color:#475569;margin:4px 0 0 0;">Material de Aprendizaje y CÃ¡tedra Â· SIGAC</h4>
  </div>
  <h3 style="color:#0f172a;">${r.titulo}</h3>
  <p><strong>Tipo:</strong> ${r.tipo} | <strong>Docente / Tutor:</strong> ${r.creadoPor || 'CÃ¡tedra'}</p>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:15px;border-radius:8px;margin:15px 0;">
    <p>${r.descripcion || 'Material de lectura y apoyo para el semestre acadÃ©mico.'}</p>
    <p><strong>Enlace del recurso:</strong> <a href="${r.url}">${r.url}</a></p>
  </div>
  <p style="font-size:11px;color:#64748b;">Descargado desde el aula virtual SIGAC - UTEQ.</p>
</body>
</html>`;
    this.descargaService.descargarArchivo(`${r.titulo.replace(/\s+/g, '_')}_UTEQ.html`, html);
  }

  descargarActividadDocumento(a: ActividadDto): void {
    if (a.archivoDataUrl) {
      this.descargaService.descargarArchivo(a.nombreArchivo || `${a.titulo}.pdf`, a.archivoDataUrl);
      return;
    }
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${a.titulo} - UTEQ</title>
<style>body{font-family:sans-serif;padding:30px;line-height:1.6;color:#1e293b;}</style>
</head>
<body>
  <div style="border-bottom:2px solid #047857;padding-bottom:10px;margin-bottom:20px;">
    <h2 style="color:#065f46;margin:0;">Universidad TÃ©cnica Estatal de Quevedo (UTEQ)</h2>
    <h4 style="color:#475569;margin:4px 0 0 0;">GuÃ­a y RÃºbrica de Actividad Evaluativa Â· SIGAC</h4>
  </div>
  <h3 style="color:#0f172a;">${a.titulo}</h3>
  <p><strong>Tipo:</strong> ${a.tipo} | <strong>Fecha de Entrega:</strong> ${a.fechaEntrega}</p>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:15px;border-radius:8px;margin:15px 0;">
    <h4>Instrucciones para la entrega:</h4>
    <p>${a.descripcion || 'Completar el informe o taller y enviarlo a travÃ©s de la plataforma.'}</p>
  </div>
  <p style="font-size:11px;color:#64748b;">AsignaciÃ³n oficial registrada en SIGAC - UTEQ.</p>
</body>
</html>`;
    this.descargaService.descargarArchivo(`${a.titulo.replace(/\s+/g, '_')}_Guia_UTEQ.html`, html);
  }
}
