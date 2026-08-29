import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../api';

export interface EvaluacionDto {
  id?: number;
  nombre: string;
  catedraId: number;
  esDiagnostica: boolean;
  adaptadaConIA: boolean;
  descripcionIA: string;
}

export interface CronogramaActividadDto {
  id: number;
  catedraId: number;
  descripcion: string;
  fechaPrevista: string;
  fechaReal?: string;
}

export interface ActividadAyudantiaDto {
  id: number;
  ayudantiaId: number;
  descripcion: string;
  fechaPlanificada: string;
  completada: boolean;
}

export interface MonitoreoAyudantiaDto {
  ayudantiaId: number;
  nombreAyudante: string;
  planificacion: ActividadAyudantiaDto[];
  bitacoras: BitacoraDto[];
}

export interface BitacoraDto {
  id: number;
  fecha: string;
  actividadesRealizadas: string;
  evidenciaUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  constructor(private http: HttpClient) {}

  private get apiUrl() { return `${getApiBase()}/api/docente`; }

  registrarEvaluacionDiagnostica(catedraId: number, dto: EvaluacionDto): Observable<EvaluacionDto> {
    return this.http.post<EvaluacionDto>(`${this.apiUrl}/catedras/${catedraId}/evaluacion-diagnostica`, dto);
  }

  reprogramarCronograma(catedraId: number, dto: CronogramaActividadDto): Observable<CronogramaActividadDto> {
    return this.http.put<CronogramaActividadDto>(`${this.apiUrl}/catedras/${catedraId}/cronograma`, dto);
  }

  planificarActividadAyudantia(ayudantiaId: number, dto: ActividadAyudantiaDto): Observable<ActividadAyudantiaDto> {
    return this.http.post<ActividadAyudantiaDto>(`${this.apiUrl}/ayudantias/${ayudantiaId}/planificacion`, dto);
  }

  monitorearAyudantia(ayudantiaId: number): Observable<MonitoreoAyudantiaDto> {
    return this.http.get<MonitoreoAyudantiaDto>(`${this.apiUrl}/ayudantias/${ayudantiaId}/monitoreo`);
  }
}
