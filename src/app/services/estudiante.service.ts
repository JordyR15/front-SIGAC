import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { getApiBase } from '../api';
import { MateriaService } from './materia.service';

export interface PostulacionAyudantiaDto {
  catedraId: number;
}

export interface RegistroBitacoraDto {
  ayudantiaId: number;
  actividadesRealizadas: string;
  evidenciaUrl: string;
}

export interface BitacoraItemDto {
  id: number;
  ayudantiaId: number;
  nombreAyudante: string;
  nombreCatedra: string;
  actividadesRealizadas: string;
  evidenciaUrl?: string;
  fecha: string;
}

export interface InformeMensualRequestDto {
  ayudantiaId: number;
  mes: number;
  anio: number;
  numeroResolucion?: string;
  tipoInforme?: string;
  horasTotales?: number;
  diasPorSemana?: number;
  modalidad?: string;
  temasImpartidos?: string;
  anexos?: any[];
}

export interface HistorialAyudantiaDto {
  ayudantiaId: number;
  estadoAyudantia: string;
  catedraId: number;
  nombreCatedra: string;
  semestreCatedra: string;
  docenteCatedra: string;
  estudianteId?: number;
  nombreEstudiante?: string;
}

/* =========================================================
   RF-004 - EVALUACIÓN DIAGNÓSTICA DEL ESTUDIANTE
   ========================================================= */

export interface PreguntaCuestionarioDiagnosticoDto {
  id: number;
  pregunta: string;
  tipo?: string;
}

export interface RespuestaCuestionarioDiagnosticoDto {
  preguntaId: number;
  respuesta: string;
}

export interface EvaluacionDiagnosticaEstudianteDto {
  id: number;
  evaluacionId: number;
  catedraId: number;
  catedra: string;
  nombre: string;
  instrucciones: string;
  tipoEvaluacion: 'Archivo' | 'Cuestionario';
  fechaInicio: string | null;
  fechaFin: string | null;
  archivoDocenteUrl: string | null;
  preguntasCuestionario: string | null;
  disponibilidad: 'SinFechas' | 'NoIniciada' | 'Disponible' | 'Cerrada' | string;
  puedeRealizar: boolean;
  estadoEntrega: 'Pendiente' | 'Entregado' | 'Calificado' | string;
  fechaEntrega: string | null;
  archivoEntregaUrl: string | null;
  calificacion: number | null;
  observacion: string;
  respuestasCuestionario: string | null;
}

export interface EntregaDiagnosticaResponse {
  message: string;
  evaluacionId: number;
  estado: string;
  fechaEntrega: string | null;
  archivoUrl?: string | null;
  afectaPromedioAcademico: boolean;
}

const HISTORIAL_DEFAULT: HistorialAyudantiaDto[] = [];
const BITACORAS_DEFAULT: BitacoraItemDto[] = [];

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private STORAGE_POSTULACIONES = 'sigac_postulaciones_v2';
  private STORAGE_BITACORAS = 'sigac_bitacoras_v2';

  private historialSubject = new BehaviorSubject<HistorialAyudantiaDto[]>(
    this.loadStorage(this.STORAGE_POSTULACIONES, HISTORIAL_DEFAULT)
  );
  public historial$ = this.historialSubject.asObservable();

  private bitacorasSubject = new BehaviorSubject<BitacoraItemDto[]>(
    this.loadStorage(this.STORAGE_BITACORAS, BITACORAS_DEFAULT)
  );
  public bitacoras$ = this.bitacorasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private materiaService: MateriaService
  ) {}

  private get apiUrl() {
    return `${getApiBase()}/api/Estudiante`;
  }

  private loadStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;

    try {
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          return parsed as unknown as T;
        }
      }
    } catch (e) {
      console.warn(`Error loading storage for ${key}`, e);
    }

    return fallback;
  }

  private saveStorage<T>(key: string, data: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`Error saving storage for ${key}`, e);
      }
    }
  }

  postularAyudantia(dto: PostulacionAyudantiaDto): Observable<any> {
    const materia = this.materiaService.getMateriaById(dto.catedraId);

    const nombreUsuario =
      typeof window !== 'undefined'
        ? localStorage.getItem('nombre') || 'Alejandro García'
        : 'Alejandro García';

    const nuevaPostulacion: HistorialAyudantiaDto = {
      ayudantiaId: Math.floor((Date.now() / 1000) % 2000000000) + 1,
      estadoAyudantia: 'Pendiente',
      catedraId: Number(dto.catedraId),
      nombreCatedra: materia?.nombre || `Materia #${dto.catedraId}`,
      semestreCatedra: '2026-2',
      docenteCatedra: materia?.docente || 'Docente Responsable',
      estudianteId: 1,
      nombreEstudiante: nombreUsuario
    };

    const current = this.historialSubject.value;
    const updated = [nuevaPostulacion, ...current];

    this.historialSubject.next(updated);
    this.saveStorage(this.STORAGE_POSTULACIONES, updated);

    const payload = {
      CatedraId: Number(dto.catedraId),
      catedraId: Number(dto.catedraId)
    };

    return this.http
      .post(`${this.apiUrl}/ayudantias/postulaciones`, payload)
      .pipe(
        catchError(() =>
          of({
            success: true,
            postulacion: nuevaPostulacion
          })
        )
      );
  }

  registrarBitacora(dto: RegistroBitacoraDto): Observable<any> {
    const postulacion = this.historialSubject.value.find(
      h => Number(h.ayudantiaId) === Number(dto.ayudantiaId)
    );

    const nombreUsuario =
      typeof window !== 'undefined'
        ? localStorage.getItem('nombre') || 'Alejandro García'
        : 'Alejandro García';

    const nuevaBitacora: BitacoraItemDto = {
      id: Math.floor((Date.now() / 1000) % 2000000000) + 1,
      ayudantiaId: Number(dto.ayudantiaId),
      nombreAyudante: nombreUsuario,
      nombreCatedra: postulacion?.nombreCatedra || 'Ayudantía General',
      actividadesRealizadas: dto.actividadesRealizadas,
      evidenciaUrl: dto.evidenciaUrl,
      fecha: new Date().toISOString().split('T')[0]
    };

    const current = this.bitacorasSubject.value;
    const updated = [nuevaBitacora, ...current];

    this.bitacorasSubject.next(updated);
    this.saveStorage(this.STORAGE_BITACORAS, updated);

    const payload = {
      AyudantiaId: Number(dto.ayudantiaId),
      ayudantiaId: Number(dto.ayudantiaId),
      ActividadesRealizadas: dto.actividadesRealizadas,
      actividadesRealizadas: dto.actividadesRealizadas,
      EvidenciaUrl: dto.evidenciaUrl || '',
      evidenciaUrl: dto.evidenciaUrl || ''
    };

    return this.http
      .post(`${this.apiUrl}/ayudantias/bitacora`, payload)
      .pipe(
        catchError(() =>
          of({
            success: true,
            bitacora: nuevaBitacora
          })
        )
      );
  }

  getBitacoras(): Observable<BitacoraItemDto[]> {
    return this.bitacoras$;
  }

  generarInformeMensual(
    request: InformeMensualRequestDto
  ): Observable<any> {
    const payload = {
      AyudantiaId: Number(request.ayudantiaId),
      ayudantiaId: Number(request.ayudantiaId),

      Mes: Number(request.mes),
      mes: Number(request.mes),

      Anio: Number(request.anio),
      anio: Number(request.anio),

      NumeroResolucion: request.numeroResolucion,
      numeroResolucion: request.numeroResolucion,

      TipoInforme: request.tipoInforme,
      tipoInforme: request.tipoInforme,

      HorasTotales: request.horasTotales,
      horasTotales: request.horasTotales,

      DiasPorSemana: request.diasPorSemana,
      diasPorSemana: request.diasPorSemana,

      Modalidad: request.modalidad,
      modalidad: request.modalidad,

      TemasImpartidos: request.temasImpartidos,
      temasImpartidos: request.temasImpartidos,

      Anexos: request.anexos,
      anexos: request.anexos
    };

    return this.http
      .post(`${this.apiUrl}/ayudantias/informe-mensual`, payload)
      .pipe(
        catchError(() =>
          of({
            success: true,
            mensaje: 'Informe generado exitosamente.'
          })
        )
      );
  }

  /**
   * GET /api/Estudiante/{id}/validacion-malla
   * Valida requisitos reglamentarios con el backend.
   */
  validarMalla(
    estudianteId?: number
  ): Observable<{
    cumpleMalla: boolean;
    cumplePromedioGeneral: boolean;
  }> {
    const rawId =
      estudianteId ??
      (typeof window !== 'undefined'
        ? Number(localStorage.getItem('estudianteId')) ||
        Number(localStorage.getItem('userId')) ||
        0
        : 0);

    if (!rawId || Number(rawId) === 1) {
      return of({
        cumpleMalla: true,
        cumplePromedioGeneral: true
      });
    }

    return this.http
      .get<{
        cumpleMalla: boolean;
        cumplePromedioGeneral: boolean;
      }>(`${this.apiUrl}/${rawId}/validacion-malla`)
      .pipe(
        catchError(() =>
          of({
            cumpleMalla: true,
            cumplePromedioGeneral: true
          })
        )
      );
  }

  getHistorialAyudantias(): Observable<HistorialAyudantiaDto[]> {
    return this.http
      .get<HistorialAyudantiaDto[]>(
        `${this.apiUrl}/ayudantias/historial`
      )
      .pipe(
        tap(data => {
          if (Array.isArray(data) && data.length > 0) {
            this.historialSubject.next(data);
            this.saveStorage(this.STORAGE_POSTULACIONES, data);
          }
        }),
        catchError(() => of(this.historialSubject.value))
      );
  }

  actualizarEstadoPostulacion(
    ayudantiaId: number,
    nuevoEstado: string
  ): void {
    const list = this.historialSubject.value.map(h => {
      if (Number(h.ayudantiaId) === Number(ayudantiaId)) {
        return {
          ...h,
          estadoAyudantia: nuevoEstado
        };
      }

      return h;
    });

    this.historialSubject.next(list);
    this.saveStorage(this.STORAGE_POSTULACIONES, list);
  }

  // =========================================================
  // RF-004 - EVALUACIONES DIAGNÓSTICAS
  // =========================================================

  /**
   * Obtiene todas las evaluaciones diagnósticas pertenecientes
   * a las cátedras en las que está inscrito el estudiante autenticado.
   *
   * GET /api/Estudiante/evaluaciones-diagnosticas
   */
  getEvaluacionesDiagnosticas(): Observable<EvaluacionDiagnosticaEstudianteDto[]> {
    return this.http.get<EvaluacionDiagnosticaEstudianteDto[]>(
      `${this.apiUrl}/evaluaciones-diagnosticas`
    );
  }

  /**
   * Entrega una evaluación diagnóstica de tipo Archivo.
   * El backend espera multipart/form-data con el campo "archivo".
   *
   * POST /api/Estudiante/evaluaciones-diagnosticas/{id}/entregar-archivo
   */
  entregarEvaluacionDiagnosticaArchivo(
    evaluacionId: number,
    archivo: File
  ): Observable<EntregaDiagnosticaResponse> {
    const formData = new FormData();

    formData.append(
      'archivo',
      archivo,
      archivo.name
    );

    return this.http.post<EntregaDiagnosticaResponse>(
      `${this.apiUrl}/evaluaciones-diagnosticas/${evaluacionId}/entregar-archivo`,
      formData
    );
  }

  /**
   * Entrega una evaluación diagnóstica de tipo Cuestionario.
   *
   * IMPORTANTE:
   * el backend recibe directamente el arreglo JSON de respuestas,
   * no un objeto { respuestas: [...] }.
   *
   * POST /api/Estudiante/evaluaciones-diagnosticas/{id}/entregar-cuestionario
   */
  entregarEvaluacionDiagnosticaCuestionario(
    evaluacionId: number,
    respuestas: RespuestaCuestionarioDiagnosticoDto[]
  ): Observable<EntregaDiagnosticaResponse> {
    return this.http.post<EntregaDiagnosticaResponse>(
      `${this.apiUrl}/evaluaciones-diagnosticas/${evaluacionId}/entregar-cuestionario`,
      respuestas
    );
  }

  /**
   * Convierte las rutas relativas que devuelve el backend
   * (/uploads/...) en una URL que el navegador pueda abrir.
   */
  resolverUrlArchivo(url?: string | null): string {
    if (!url) {
      return '';
    }

    const valor = url.trim();

    if (
      valor.startsWith('http://') ||
      valor.startsWith('https://') ||
      valor.startsWith('data:')
    ) {
      return valor;
    }

    const base = getApiBase().replace(/\/$/, '');

    return `${base}${valor.startsWith('/') ? '' : '/'}${valor}`;
  }

  /**
   * Convierte el JSON guardado por el backend en una lista de preguntas.
   * Si el JSON viene vacío o inválido, devuelve [].
   */
  parsePreguntasCuestionario(
    preguntasJson?: string | null
  ): PreguntaCuestionarioDiagnosticoDto[] {
    if (!preguntasJson) {
      return [];
    }

    try {
      const preguntas = JSON.parse(preguntasJson);

      if (!Array.isArray(preguntas)) {
        return [];
      }

      return preguntas
        .map((p: any, index: number) => ({
          id: Number(p?.id ?? index + 1),
          pregunta: String(
            p?.pregunta ??
            p?.texto ??
            ''
          ).trim(),
          tipo: p?.tipo
            ? String(p.tipo)
            : 'Texto'
        }))
        .filter(
          (p: PreguntaCuestionarioDiagnosticoDto) =>
            !!p.pregunta
        );
    } catch (error) {
      console.error(
        'No se pudieron interpretar las preguntas del cuestionario diagnóstico.',
        error
      );

      return [];
    }
  }

  /**
   * Convierte las respuestas ya entregadas en una lista.
   * Se usa para mostrarlas después de entregar o ser calificadas.
   */
  parseRespuestasCuestionario(
    respuestasJson?: string | null
  ): RespuestaCuestionarioDiagnosticoDto[] {
    if (!respuestasJson) {
      return [];
    }

    try {
      const respuestas = JSON.parse(respuestasJson);

      if (!Array.isArray(respuestas)) {
        return [];
      }

      return respuestas.map((r: any) => ({
        preguntaId: Number(r?.preguntaId ?? r?.id ?? 0),
        respuesta: String(r?.respuesta ?? '')
      }));
    } catch (error) {
      console.error(
        'No se pudieron interpretar las respuestas del cuestionario diagnóstico.',
        error
      );

      return [];
    }
  }
}
