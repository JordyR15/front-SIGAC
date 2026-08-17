import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateRecursoDto {
  titulo: string;
  descripcion: string;
  url: string;
  esEsencial: boolean;
  materiaId: number;
}

export interface RecursoDto {
  id: number;
  titulo: string;
  descripcion: string;
  url: string;
  esEsencial: boolean;
  materiaId: number;
}

export interface CreateActividadDto {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  tipo: string;
  materiaId: number;
}

export interface ActividadDto {
  id: number;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  tipo: string;
  estado: string;
  materiaId: number;
}

export interface RecursoConEstadoDto extends RecursoDto {
  visto: boolean;
}

export interface MarkRecursoAsSeenDto {
  recursoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  private apiUrl = 'http://localhost:5291/api/materia';

  constructor(private http: HttpClient) {}

  // Recursos
  getRecursosByMateria(materiaId: number): Observable<RecursoDto[]> {
    return this.http.get<RecursoDto[]>(`${this.apiUrl}/${materiaId}/recursos`);
  }

  addRecurso(materiaId: number, dto: CreateRecursoDto): Observable<RecursoDto> {
    return this.http.post<RecursoDto>(`${this.apiUrl}/${materiaId}/recursos`, dto);
  }

  getRecursosConEstado(materiaId: number): Observable<RecursoConEstadoDto[]> {
    return this.http.get<RecursoConEstadoDto[]>(`${this.apiUrl}/${materiaId}/recursos/estado`);
  }

  marcarRecursoComoVisto(recursoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recursos/marcar-visto`, { recursoId } as MarkRecursoAsSeenDto);
  }

  // Actividades
  getActividadesByMateria(materiaId: number): Observable<ActividadDto[]> {
    return this.http.get<ActividadDto[]>(`${this.apiUrl}/${materiaId}/actividades`);
  }

  addActividad(materiaId: number, dto: CreateActividadDto): Observable<ActividadDto> {
    return this.http.post<ActividadDto>(`${this.apiUrl}/${materiaId}/actividades`, dto);
  }
}
