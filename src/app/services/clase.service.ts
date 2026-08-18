import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateClaseDto {
  nombre: string;
  materiaId: number;
  docenteId: number;
  estudianteIds: number[];
}

export interface ClaseDto {
  id: number;
  nombre: string;
  materiaId: number;
  docenteId: number;
  estudianteIds: number[];
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

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private apiUrl = 'http://localhost:5291/api/clase';
  private sesionApiUrl = 'http://localhost:5291/api/clasesesion';

  constructor(private http: HttpClient) {}

  // Clase
  createClase(dto: CreateClaseDto): Observable<ClaseDto> {
    return this.http.post<ClaseDto>(this.apiUrl, dto);
  }

  getClaseById(id: number): Observable<ClaseDto> {
    return this.http.get<ClaseDto>(`${this.apiUrl}/${id}`);
  }

  addEstudiantesToClase(claseId: number, estudianteIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${claseId}/estudiantes`, estudianteIds);
  }

  getEstudiantesFromClase(claseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${claseId}/estudiantes`);
  }

  // Sesiones
  createClaseSesion(dto: CreateClaseSesionDto): Observable<ClaseSesionDto> {
    return this.http.post<ClaseSesionDto>(this.sesionApiUrl, dto);
  }

  getClaseSesionById(id: number): Observable<ClaseSesionDto> {
    return this.http.get<ClaseSesionDto>(`${this.sesionApiUrl}/${id}`);
  }

  getSesionesByMateria(materiaId: number): Observable<ClaseSesionDto[]> {
    return this.http.get<ClaseSesionDto[]>(`${this.sesionApiUrl}/materia/${materiaId}`);
  }

  // Asistencia
  registrarAsistencia(claseSesionId: number, dto: CreateAsistenciaDto): Observable<AsistenciaDto> {
    return this.http.post<AsistenciaDto>(`${this.sesionApiUrl}/${claseSesionId}/asistencia`, dto);
  }

  getAsistenciaBySesion(claseSesionId: number): Observable<AsistenciaDto[]> {
    return this.http.get<AsistenciaDto[]>(`${this.sesionApiUrl}/${claseSesionId}/asistencia`);
  }
}
