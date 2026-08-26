import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../api';

export interface PostulacionAyudantiaDto {
  catedraId: number;
}

export interface RegistroBitacoraDto {
  ayudantiaId: number;
  actividadesRealizadas: string;
  evidenciaUrl: string;
}

export interface InformeMensualRequestDto {
  ayudantiaId: number;
  mes: number;
  anio: number;
}

export interface HistorialAyudantiaDto {
  ayudantiaId: number;
  estadoAyudantia: string;
  catedraId: number;
  nombreCatedra: string;
  semestreCatedra: string;
  docenteCatedra: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = `${API_BASE}/api/estudiante`;

  constructor(private http: HttpClient) {}

  postularAyudantia(dto: PostulacionAyudantiaDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ayudantias/postulaciones`, dto);
  }

  registrarBitacora(dto: RegistroBitacoraDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ayudantias/bitacora`, dto);
  }

  generarInformeMensual(request: InformeMensualRequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ayudantias/informe-mensual`, request);
  }

  getHistorialAyudantias(): Observable<HistorialAyudantiaDto[]> {
    return this.http.get<HistorialAyudantiaDto[]>(`${this.apiUrl}/ayudantias/historial`);
  }
}
