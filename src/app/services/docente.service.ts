import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getApiBase } from '../api';

export interface PreguntaCuestionarioDto {
  id: number;
  pregunta: string;
  tipo: string;
}

export interface EvaluacionDto {
  id?: number;
  nombre: string;
  catedraId: number;
  esDiagnostica: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  tipoEvaluacion: 'Archivo' | 'Cuestionario';
  instrucciones: string;
  archivoDocenteUrl?: string | null;
  preguntasCuestionario?: string | null;
}

export interface ResultadoDiagnosticoEntradaDto {
  estudianteId: number;
  calificacion: number | null;
  observacion: string;
}

export interface RegistrarResultadosDiagnosticosDto {
  resultados: ResultadoDiagnosticoEntradaDto[];
}

export interface ResultadoEvaluacionDiagnosticaDto {
  id: number;
  evaluacionId: number;
  estudianteId: number;
  nombreEstudiante: string;
  calificacion: number | null;
  observacion: string;
  archivoEntregaUrl: string | null;
  fechaEntrega: string | null;
  estado: string;
  respuestasCuestionario: string | null;
  fechaRegistro: string;
}

export interface ResumenEvaluacionDiagnosticaDto {
  estudiantesEvaluados: number;
  promedioDiagnostico: number;
  calificacionMinima: number;
  calificacionMaxima: number;
  afectaPromedioAcademico: boolean;
}

export interface GuardarResultadosDiagnosticosResponse {
  message: string;
  evaluacionId: number;
  estudiantesEvaluados: number;
  promedioDiagnostico: number;
  calificacionMinima: number;
  calificacionMaxima: number;
  afectaPromedioAcademico: boolean;
}

export interface DetalleEvaluacionDiagnosticaResponse {
  evaluacion: {
    id: number;
    nombre: string;
    catedraId: number;
    esDiagnostica: boolean;
    fechaInicio: string | null;
    fechaFin: string | null;
    tipoEvaluacion: 'Archivo' | 'Cuestionario';
    instrucciones: string;
    archivoDocenteUrl: string | null;
    preguntasCuestionario: string | null;
  };

  resultados: ResultadoEvaluacionDiagnosticaDto[];

  resumen: ResumenEvaluacionDiagnosticaDto;
}

export interface CronogramaActividadDto {
  id: number;
  catedraId: number;
  descripcion: string;
  fechaPrevista: string;
  fechaReal?: string | null;
  observacionCambio: string;
}

export interface HistorialCronogramaDto {
  id: number;
  actividadId: number;
  actividadActual: string;
  fechaAnterior: string;
  fechaNueva: string;
  descripcionAnterior: string;
  descripcionNueva: string;
  observacionCambio: string;
  fechaModificacion: string;
}

export interface ReprogramarCronogramaResponse {
  message: string;
  actividad: {
    id: number;
    catedraId: number;
    descripcion: string;
    fechaPrevista: string;
    fechaReal: string | null;
  };
  cambio: {
    id: number;
    fechaAnterior: string;
    fechaNueva: string;
    descripcionAnterior: string;
    descripcionNueva: string;
    observacionCambio: string;
    fechaModificacion: string;
  };
  notificacionEstudiantes: boolean;
}

export interface ActividadAyudantiaDto {
  id: number;
  ayudantiaId: number;
  descripcion: string;
  fechaPlanificada: string;
  completada: boolean;
  tema?: string;
  semana?: number;
  directrices?: string;
  recursosSugeridos?: string;
}

export interface MonitoreoAyudantiaDto {
  ayudantiaId: number;
  nombreAyudante: string;
  nombreCatedra?: string;
  planificacion: ActividadAyudantiaDto[];
  bitacoras: BitacoraDto[];
}

export interface BitacoraDto {
  id: number;
  fecha: string;
  actividadesRealizadas: string;
  evidenciaUrl: string;
}

export interface HorarioOcupadoAlumnoDto {
  id?: number;
  claseId: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  materiaOcupada: string;
  tipo: string;
  carrera?: string;
}

/* =========================================================
   GESTIÓN DE ESTUDIANTES
   ========================================================= */

export interface EstudianteClaseDocenteDto {
  id: number;
  estudianteId: number;
  username: string;
  nombreCompleto: string;
  nombre: string;
  apellido?: string;
  correo: string;
  email?: string;
  cedula: string;
  ci?: string;
  catedraId: number | null;
  promedioActual: number | null;
  alertaRendimiento: boolean | null;
}

export interface ClaseDocenteDto {
  id: number;
  claseId: number;
  nombre: string;
  materiaId: number;
  catedraId?: number | null;
  materia: string;
  nombreMateria: string;
  codigoMateria: string;
  docenteId: number;
  docente: string;
  docenteNombre: string;
  docenteEmail: string;
  estudiantesCount: number;
  estudianteIds?: number[];
  estudiantes: EstudianteClaseDocenteDto[];
}

export interface CatedraResumenDto {
  id: number;
  nombre: string;
  semestre: string;
}

export interface IndicadorCualitativoDto {
  id: number;
  estudianteId: number;
  catedraId: number;
  indicador: string;
  observacion: string;
  fecha: string;
}

export interface CrearIndicadorCualitativoDto {
  indicador: string;
  observacion: string;
}

export interface HistorialAcademicoDto {
  nombreCatedra: string;
  calificacionFinal: number;
  periodo: string;
}

export interface ExpedienteDto {
  estudianteId: number;
  nombreEstudiante: string;
  historial: HistorialAcademicoDto[];
  indicadores: IndicadorCualitativoDto[];
}

export interface MatricularEstudianteDto {
  nombre: string;
  apellido: string;
  correo: string;
  cedula?: string;
}

/* =========================================================
   DATOS EXISTENTES DE OTROS MÓDULOS
   Se mantienen para no romper funcionalidades todavía.
   ========================================================= */

const PLANIFICACIONES_DEFAULT: Record<number, ActividadAyudantiaDto[]> = {};
const OCUPACIONES_DEFAULT: HorarioOcupadoAlumnoDto[] = [];

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private STORAGE_PLANIFICACION = 'sigac_docente_planificaciones_v2';
  private STORAGE_OCUPACIONES = 'sigac_docente_ocupaciones_alumnos_v2';

  private planificacionesSubject = new BehaviorSubject<Record<number, ActividadAyudantiaDto[]>>(
    this.loadStorage(this.STORAGE_PLANIFICACION, PLANIFICACIONES_DEFAULT),
  );

  public planificaciones$ = this.planificacionesSubject.asObservable();

  private ocupacionesSubject = new BehaviorSubject<HorarioOcupadoAlumnoDto[]>(
    this.loadStorage(this.STORAGE_OCUPACIONES, OCUPACIONES_DEFAULT),
  );

  public ocupaciones$ = this.ocupacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private get apiUrl(): string {
    return `${getApiBase()}/api/Docente`;
  }

  /* =========================================================
     CLASES DEL DOCENTE
     ========================================================= */

  getClasesDocente(): Observable<ClaseDocenteDto[]> {
    return this.http.get<ClaseDocenteDto[]>(`${this.apiUrl}/clases`);
  }

  cargarClasesDocente(docenteId?: number): Observable<ClaseDocenteDto[]> {
    return this.getClasesDocente();
  }

  /* =========================================================
     EXPEDIENTE - RF-002
     ========================================================= */

  getExpedienteEstudiante(estudianteId: number): Observable<ExpedienteDto> {
    return this.http.get<ExpedienteDto>(`${this.apiUrl}/estudiantes/${estudianteId}/expediente`);
  }

  /* =========================================================
     CÁTEDRAS DEL ESTUDIANTE
     ========================================================= */

  getCatedrasEstudiante(estudianteId: number): Observable<CatedraResumenDto[]> {
    return this.http.get<CatedraResumenDto[]>(
      `${this.apiUrl}/estudiantes/${estudianteId}/catedras`,
    );
  }

  /* =========================================================
     INDICADORES CUALITATIVOS - RF-003
     ========================================================= */

  getIndicadoresCualitativos(
    catedraId: number,
    estudianteId: number,
  ): Observable<IndicadorCualitativoDto[]> {
    return this.http.get<IndicadorCualitativoDto[]>(
      `${this.apiUrl}/catedras/${catedraId}/estudiantes/${estudianteId}/indicadores`,
    );
  }

  crearIndicadorCualitativo(
    catedraId: number,
    estudianteId: number,
    dto: CrearIndicadorCualitativoDto,
  ): Observable<IndicadorCualitativoDto> {
    return this.http.post<IndicadorCualitativoDto>(
      `${this.apiUrl}/catedras/${catedraId}/estudiantes/${estudianteId}/indicadores`,
      dto,
    );
  }

  /* =========================================================
     MATRÍCULA DE ESTUDIANTES
     ========================================================= */

  matricularEstudianteClase(claseId: number, dto: MatricularEstudianteDto): Observable<any> {
    return this.http.post(`${getApiBase()}/api/Clase/${claseId}/estudiantes`, dto);
  }

  eliminarEstudianteClase(claseId: number, estudianteId: number): Observable<any> {
    return this.http.delete(`${getApiBase()}/api/Clase/${claseId}/estudiantes/${estudianteId}`);
  }

  /* =========================================================
     EVALUACIÓN DIAGNÓSTICA - RF-004
     ========================================================= */

  registrarEvaluacionDiagnostica(catedraId: number, dto: EvaluacionDto): Observable<EvaluacionDto> {
    return this.http.post<EvaluacionDto>(
      `${this.apiUrl}/catedras/${catedraId}/evaluacion-diagnostica`,
      dto,
    );
  }

  obtenerEvaluacionesDiagnosticas(catedraId: number): Observable<EvaluacionDto[]> {
    return this.http.get<EvaluacionDto[]>(
      `${this.apiUrl}/catedras/${catedraId}/evaluaciones-diagnosticas`,
    );
  }

  guardarResultadosEvaluacionDiagnostica(
    catedraId: number,
    evaluacionId: number,
    dto: RegistrarResultadosDiagnosticosDto,
  ): Observable<GuardarResultadosDiagnosticosResponse> {
    return this.http.post<GuardarResultadosDiagnosticosResponse>(
      `${this.apiUrl}/catedras/${catedraId}/evaluaciones-diagnosticas/${evaluacionId}/resultados`,
      dto,
    );
  }

  obtenerResultadosEvaluacionDiagnostica(
    catedraId: number,
    evaluacionId: number,
  ): Observable<DetalleEvaluacionDiagnosticaResponse> {
    return this.http.get<DetalleEvaluacionDiagnosticaResponse>(
      `${this.apiUrl}/catedras/${catedraId}/evaluaciones-diagnosticas/${evaluacionId}/resultados`,
    );
  }

  /* =========================================================
     CRONOGRAMA - RF-005
     ========================================================= */

  getCronogramaByCatedra(catedraId: number): Observable<CronogramaActividadDto[]> {
    return this.http.get<CronogramaActividadDto[]>(`${getApiBase()}/api/Cronograma/${catedraId}`);
  }

  crearCronogramaActividad(
    dto: Omit<CronogramaActividadDto, 'id'>,
  ): Observable<CronogramaActividadDto> {
    return this.http.post<CronogramaActividadDto>(`${getApiBase()}/api/Cronograma`, dto);
  }

  reprogramarCronograma(
    catedraId: number,
    dto: CronogramaActividadDto,
  ): Observable<ReprogramarCronogramaResponse> {
    return this.http.put<ReprogramarCronogramaResponse>(
      `${getApiBase()}/api/Cronograma/${catedraId}/reprogramar`,
      dto,
    );
  }

  obtenerHistorialCronograma(catedraId: number): Observable<HistorialCronogramaDto[]> {
    return this.http.get<HistorialCronogramaDto[]>(
      `${getApiBase()}/api/Cronograma/${catedraId}/historial`,
    );
  }

  /* =========================================================
     AYUDANTÍAS
     ========================================================= */

  planificarActividadAyudantia(
    ayudantiaId: number,
    dto: ActividadAyudantiaDto,
  ): Observable<ActividadAyudantiaDto> {
    const itemGuardado: ActividadAyudantiaDto = {
      ...dto,
      id: dto.id || Math.floor((Date.now() / 1000) % 2000000000) + 1,

      ayudantiaId: Number(ayudantiaId),
    };

    const currentMap = {
      ...this.planificacionesSubject.value,
    };

    const listaActual = currentMap[ayudantiaId] || [];

    currentMap[ayudantiaId] = [itemGuardado, ...listaActual];

    this.planificacionesSubject.next(currentMap);

    this.saveStorage(this.STORAGE_PLANIFICACION, currentMap);

    return this.http
      .post<ActividadAyudantiaDto>(`${this.apiUrl}/ayudantias/${ayudantiaId}/planificacion`, dto)
      .pipe(
        tap((res) => {
          if (res && res.id) {
            itemGuardado.id = res.id;

            this.saveStorage(this.STORAGE_PLANIFICACION, this.planificacionesSubject.value);
          }
        }),

        catchError(() => of(itemGuardado)),
      );
  }

  toggleActividadPlanificada(ayudantiaId: number, actividadId: number): Observable<boolean> {
    const currentMap = {
      ...this.planificacionesSubject.value,
    };

    const lista = currentMap[ayudantiaId] || [];

    currentMap[ayudantiaId] = lista.map((actividad) => {
      if (actividad.id === actividadId) {
        return {
          ...actividad,
          completada: !actividad.completada,
        };
      }

      return actividad;
    });

    this.planificacionesSubject.next(currentMap);

    this.saveStorage(this.STORAGE_PLANIFICACION, currentMap);

    return of(true);
  }

  eliminarActividadPlanificada(ayudantiaId: number, actividadId: number): Observable<boolean> {
    const currentMap = {
      ...this.planificacionesSubject.value,
    };

    const lista = currentMap[ayudantiaId] || [];

    currentMap[ayudantiaId] = lista.filter((actividad) => actividad.id !== actividadId);

    this.planificacionesSubject.next(currentMap);

    this.saveStorage(this.STORAGE_PLANIFICACION, currentMap);

    return of(true);
  }

  toggleActividadCompletada(ayudantiaId: number, actividadId: number): Observable<boolean> {
    const currentMap = {
      ...this.planificacionesSubject.value,
    };

    const lista = currentMap[ayudantiaId] || PLANIFICACIONES_DEFAULT[ayudantiaId] || [];

    const item = lista.find((actividad) => actividad.id === actividadId);

    if (!item) {
      return of(false);
    }

    item.completada = !item.completada;

    currentMap[ayudantiaId] = [...lista];

    this.planificacionesSubject.next(currentMap);

    this.saveStorage(this.STORAGE_PLANIFICACION, currentMap);

    return of(true);
  }

  getPlanificacionAyudantia(ayudantiaId: number): Observable<ActividadAyudantiaDto[]> {
    return this.planificaciones$.pipe(
      map((mapa) => mapa[ayudantiaId] || PLANIFICACIONES_DEFAULT[ayudantiaId] || []),
    );
  }

  monitorearAyudantia(ayudantiaId: number): Observable<MonitoreoAyudantiaDto> {
    const planLocal = this.planificacionesSubject.value[ayudantiaId] || [];

    return this.http
      .get<MonitoreoAyudantiaDto>(`${this.apiUrl}/ayudantias/${ayudantiaId}/monitoreo`)
      .pipe(
        map((backendRes) => ({
          ayudantiaId,

          nombreAyudante: backendRes?.nombreAyudante || 'Ayudante de Cátedra',

          nombreCatedra: backendRes?.nombreCatedra,

          planificacion: backendRes?.planificacion || planLocal,

          bitacoras: backendRes?.bitacoras || [],
        })),

        catchError(() =>
          of({
            ayudantiaId,

            nombreAyudante: 'Ayudante de Cátedra',

            planificacion: planLocal,

            bitacoras: [],
          }),
        ),
      );
  }

  /* =========================================================
     HORARIOS
     ========================================================= */

  getHorariosOcupadosAlumnos(claseId?: number): Observable<HorarioOcupadoAlumnoDto[]> {
    return this.ocupaciones$.pipe(
      map((list) => {
        if (!claseId) {
          return list;
        }

        return list.filter((ocupacion) => Number(ocupacion.claseId) === Number(claseId));
      }),
    );
  }

  verificarConflictoHorario(
    claseId: number,
    dia: string,
    horaInicio: string,
    horaFin: string,
  ): HorarioOcupadoAlumnoDto | null {
    const list = this.ocupacionesSubject.value.filter(
      (ocupacion) => Number(ocupacion.claseId) === Number(claseId),
    );

    const parseHora = (hora: string) => {
      const [hh, mm] = hora.split(':').map(Number);

      return (hh || 0) * 60 + (mm || 0);
    };

    const nuevoInicio = parseHora(horaInicio);

    const nuevoFin = parseHora(horaFin);

    for (const item of list) {
      if (item.dia.toLowerCase() === dia.toLowerCase()) {
        const itemInicio = parseHora(item.horaInicio);

        const itemFin = parseHora(item.horaFin);

        if (Math.max(nuevoInicio, itemInicio) < Math.min(nuevoFin, itemFin)) {
          return item;
        }
      }
    }

    return null;
  }

  /* =========================================================
     MÉTODOS INTERNOS LEGACY
     ========================================================= */

  private loadStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
      return fallback;
    }

    try {
      const stored = localStorage.getItem(key);

      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Error reading ${key}`, error);
    }

    return fallback;
  }

  private saveStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Error saving ${key}`, error);
    }
  }
}
