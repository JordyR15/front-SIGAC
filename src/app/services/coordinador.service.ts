import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../api';

export interface SolicitudAyudantiaDto {
  ayudantiaId: number;
  estudianteId: number;
  nombreEstudiante: string;
  catedraId: number;
  nombreCatedra: string;
  estado: string;
}

export interface AsignacionAyudantiaDto {
  ayudantiaId: number;
}

export interface GestionEstadoAyudantiaDto {
  nuevoEstado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoordinadorService {
  private apiUrl = `${API_BASE}/api/coordinador`;

  constructor(private http: HttpClient) {}

  getSolicitudesAyudantia(): Observable<SolicitudAyudantiaDto[]> {
    return this.http.get<SolicitudAyudantiaDto[]>(`${this.apiUrl}/ayudantias/solicitudes`);
  }

  asignarAyudante(dto: AsignacionAyudantiaDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ayudantias/asignar`, dto);
  }

  getSeguimientoAyudantias(): Observable<SolicitudAyudantiaDto[]> {
    return this.http.get<SolicitudAyudantiaDto[]>(`${this.apiUrl}/ayudantias/seguimiento`);
  }

  gestionarEstadoAyudantia(ayudantiaId: number, dto: GestionEstadoAyudantiaDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/ayudantias/${ayudantiaId}/estado`, dto);
  }

  getReportesAdministrativos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ayudantias/reportes-administrativos`);
  }
}
