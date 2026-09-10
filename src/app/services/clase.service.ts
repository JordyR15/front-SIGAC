import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { getApiBase } from '../api';

export interface CreateClaseDto {
  nombre: string;
  materiaId?: number;
  materiaIds?: number[];
  docenteId?: number;
  estudianteIds?: number[];
  semestre?: string;
  descripcion?: string;
  carrera?: string;
}

export interface ClaseDto {
  id: number;
  nombre: string;
  materiaId?: number;
  materiaIds?: number[];
  docenteId?: number;
  estudianteIds?: number[];
  semestre?: string;
  descripcion?: string;
  carrera?: string;
}

export interface CreateClaseSesionDto {
  materiaId: number;
  claseId?: number;
  docenteId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoClase: string;
  linkVirtual?: string;
  aplicacionVirtual?: string;
  edificioPresencial?: string;
  aulaPresencial?: string;
  pisoPresencial?: string;
}

export interface ClaseSesionDto {
  id: number;
  materiaId: number;
  claseId?: number;
  docenteId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoClase: string;
  linkVirtual?: string;
  aplicacionVirtual?: string;
  edificioPresencial?: string;
  aulaPresencial?: string;
  pisoPresencial?: string;
}

export interface CreateAsistenciaDto {
  claseSesionId: number;
  estudianteId: number;
  presente: boolean;
}

export interface AsistenciaDto {
  id: number;
  claseSesionId: number;
  estudianteId: number;
  presente: boolean;
}

const CLASES_DEFAULT: ClaseDto[] = [];

const SESIONES_DEFAULT: ClaseSesionDto[] = [];

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private STORAGE_CLASES = 'sigac_clases_v2';
  private STORAGE_SESIONES = 'sigac_sesiones_v2';

  private clasesSubject = new BehaviorSubject<ClaseDto[]>([]);
  public clases$ = this.clasesSubject.asObservable();

  private sesionesSubject = new BehaviorSubject<ClaseSesionDto[]>([]);
  public sesiones$ = this.sesionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private get apiUrl() { return `${getApiBase()}/api/Clase`; }
  private get sesionApiUrl() { return `${getApiBase()}/api/ClaseSesion`; }

  private loadStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as unknown as T;
        }
      }
    } catch (e) {
      console.warn(`Error loading storage for ${key}`, e);
    }
    return fallback;
  }

  private saveStorage<T>(key: string, data: T) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`Error saving storage for ${key}`, e);
      }
    }
  }

  // Clase
  getClases(): Observable<ClaseDto[]> {
    return this.refreshClases();
  }

  refreshClases(): Observable<ClaseDto[]> {
    return this.http.get<any[]>(`${getApiBase()}/api/Clase`).pipe(
      timeout(10000),
      map((res) => this.normalizeClasesResponse(res)),
      tap((list) => this.clasesSubject.next(list)),
      catchError((err) => {
        console.error('No se pudieron listar las clases desde el backend:', err);
        return throwError(() => err);
      })
    );
  }

  private normalizeClasesResponse(res: any): ClaseDto[] {
    let list: any[] = [];
    if (Array.isArray(res)) {
      list = res;
    } else if (res && Array.isArray(res.clases)) {
      list = res.clases;
    } else if (res && Array.isArray(res.items)) {
      list = res.items;
    }

    return list.map((item, index) => ({
      id: Number(item.id ?? item.claseId ?? index + 1),
      nombre: String(item.nombre ?? item.nombreClase ?? `Clase ${index + 1}`),
      materiaId: item.materiaId ?? item.materia?.id ?? undefined,
      materiaIds: Array.isArray(item.materiaIds) ? item.materiaIds : (item.materiaId ? [Number(item.materiaId)] : []),
      docenteId: item.docenteId ?? item.docente?.id ?? undefined,
      estudianteIds: Array.isArray(item.estudianteIds) ? item.estudianteIds : (Array.isArray(item.estudiantes) ? item.estudiantes.map((e: any) => Number(e.id ?? e.estudianteId ?? 0)).filter(Boolean) : []),
      semestre: item.semestre ?? item.periodo ?? '2026-2',
      descripcion: item.descripcion ?? '',
      carrera: item.carrera ?? item.programa ?? 'Ingeniería de Software'
    }));
  }

  createClase(dto: CreateClaseDto): Observable<ClaseDto> {
    const matIds = dto.materiaIds && dto.materiaIds.length > 0
      ? dto.materiaIds
      : (dto.materiaId ? [Number(dto.materiaId)] : []);

    const resolvedMateriaId = Number(dto.materiaId || (matIds.length > 0 ? matIds[0] : 101));
    const resolvedDocenteId = dto.docenteId ? Number(dto.docenteId) : undefined;

    const postPayload: any = {
      nombre: dto.nombre.trim(),
      semestre: dto.semestre || '2026-2',
      carrera: dto.carrera || 'Ingeniería',
      descripcion: dto.descripcion?.trim() || ''
    };

    if (Number.isFinite(resolvedMateriaId) && resolvedMateriaId > 0) {
      postPayload.materiaId = resolvedMateriaId;
    }
    if (resolvedDocenteId && Number.isFinite(resolvedDocenteId) && resolvedDocenteId > 0) {
      postPayload.docenteId = resolvedDocenteId;
    }
    if (dto.estudianteIds && dto.estudianteIds.length > 0) {
      postPayload.estudianteIds = dto.estudianteIds;
    }

    return this.http.post<any>(`${getApiBase()}/api/Clase`, postPayload).pipe(
      timeout(10000),
      map((res) => {
        const created = {
          id: Number(res?.id ?? res?.claseId),
          nombre: String(res?.nombre ?? dto.nombre.trim()),
          materiaId: Number(res?.materiaId ?? resolvedMateriaId),
          materiaIds: Array.isArray(res?.materiaIds) ? res.materiaIds : (matIds.length > 0 ? matIds : [resolvedMateriaId]),
          docenteId: res?.docenteId ? Number(res.docenteId) : (resolvedDocenteId ?? undefined),
          estudianteIds: Array.isArray(res?.estudianteIds) ? res.estudianteIds : (dto.estudianteIds ?? []),
          semestre: String(res?.semestre ?? dto.semestre ?? '2026-2'),
          descripcion: String(res?.descripcion ?? dto.descripcion ?? ''),
          carrera: String(res?.carrera ?? dto.carrera ?? 'Ingeniería')
        };

        if (!created.id || Number.isNaN(created.id)) {
          throw new Error('La respuesta del backend no incluye un identificador de clase válido.');
        }

        const current = this.clasesSubject.value;
        this.clasesSubject.next([created, ...current.filter(c => Number(c.id) !== Number(created.id))]);
        return created;
      }),
      catchError((err) => {
        console.error('No se pudo crear la clase en el backend:', err);
        return throwError(() => err);
      })
    );
  }

  deleteClase(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(10000),
      map(() => {
        const list = this.clasesSubject.value.filter(c => Number(c.id) !== Number(id));
        this.clasesSubject.next(list);
        return true;
      }),
      catchError((err) => {
        console.error('No se pudo eliminar la clase en el backend:', err);
        return throwError(() => err);
      })
    );
  }

  getClaseById(id: number): Observable<ClaseDto> {
    const found = this.clasesSubject.value.find(c => Number(c.id) === Number(id));
    if (found) {
      return of(found);
    }
    return this.http.get<ClaseDto>(`${this.apiUrl}/${id}`);
  }

  addEstudiantesToClase(claseId: number, estudianteIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${claseId}/estudiantes`, estudianteIds);
  }

  /**
   * DELETE /api/Clase/{claseId}/estudiantes/{estudianteId}
   * Elimina un estudiante de la clase
   */
  eliminarEstudiante(claseId: number, estudianteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${claseId}/estudiantes/${estudianteId}`);
  }

  getEstudiantesFromClase(claseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${claseId}/estudiantes`);
  }

  // Sesiones
  createClaseSesion(dto: CreateClaseSesionDto): Observable<ClaseSesionDto> {
    return this.http.post<ClaseSesionDto>(this.sesionApiUrl, dto);
  }

  getClaseSesionById(id: number): Observable<ClaseSesionDto> {
    const found = this.sesionesSubject.value.find(s => Number(s.id) === Number(id));
    if (found) return of(found);
    return this.http.get<ClaseSesionDto>(`${this.sesionApiUrl}/${id}`);
  }

  getSesionesByMateria(materiaId: number): Observable<ClaseSesionDto[]> {
    return this.sesiones$.pipe(
      map(list => list.filter(s => Number(s.materiaId) === Number(materiaId)))
    );
  }

  getSesionesByClase(claseId: number): Observable<ClaseSesionDto[]> {
    return this.sesiones$.pipe(
      map(list => list.filter(s => Number(s.claseId) === Number(claseId)))
    );
  }

  // Asistencia
  registrarAsistencia(claseSesionId: number, dto: CreateAsistenciaDto): Observable<AsistenciaDto> {
    return this.http.post<AsistenciaDto>(`${this.sesionApiUrl}/${claseSesionId}/asistencia`, dto);
  }

  getAsistenciaBySesion(claseSesionId: number): Observable<AsistenciaDto[]> {
    return this.http.get<AsistenciaDto[]>(`${this.sesionApiUrl}/${claseSesionId}/asistencia`);
  }

  getAsistenciaEstudiante(claseSesionId: number): Observable<any> {
    return this.http.get<any>(`${this.sesionApiUrl}/estudiante/asistencia/${claseSesionId}`);
  }
}
