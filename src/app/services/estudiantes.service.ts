import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { getApiBase } from '../api';

export interface BulkUploadResponseDto {
  createdCount: number;
  createdUsernames: string[];
  errors: string[];
  jobId?: string;
  totalFilasProcesadas?: number;
}

export interface ImportJobResultDto {
  jobId: string;
  estado: 'Completado' | 'Procesando' | 'Fallido';
  fechaInicio: string;
  fechaFin?: string;
  totalRegistros: number;
  exitosos: number;
  fallidos: number;
  detallesErrores: Array<{ fila: number; cedula?: string; error: string }>;
}

export interface EstudianteBulkItemDto {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  carrera?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {
  private http = inject(HttpClient);

  private get apiUrl() {
    return `${getApiBase()}/api/estudiantes`;
  }

  private mapBulkUploadResponse(res: any): BulkUploadResponseDto {
    return {
      createdCount: Number(res?.CreatedCount ?? res?.createdCount ?? 0),
      createdUsernames: res?.CreatedUsernames ?? res?.createdUsernames ?? [],
      errors: res?.Errors ?? res?.errors ?? [],
      jobId: res?.JobId ?? res?.jobId,
      totalFilasProcesadas: res?.TotalFilasProcesadas ?? res?.totalFilasProcesadas
    };
  }

  /**
   * POST /api/estudiantes/bulk-upload
   * Roles: Admin, Decano, Coord, Docente
   * Recibe multipart/form-data (.xlsx o .csv) con columnas: nombres, apellidos, cedula, correo.
   * Retorna: { CreatedCount, CreatedUsernames, Errors }
   */
  bulkUpload(archivo: File): Observable<BulkUploadResponseDto> {
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);

    return this.http.post<any>(`${this.apiUrl}/bulk-upload`, formData).pipe(
      map((res: any) => this.mapBulkUploadResponse(res)),
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Carga masiva con reporte de progreso de carga (0 a 100%)
   */
  bulkUploadConProgreso(archivo: File): Observable<{ progreso: number; respuesta?: BulkUploadResponseDto }> {
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);

    const req = new HttpRequest('POST', `${this.apiUrl}/bulk-upload`, formData, {
      reportProgress: true
    });

    return this.http.request<BulkUploadResponseDto>(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progreso = event.total ? Math.round((100 * event.loaded) / event.total) : 50;
            return { progreso };
          case HttpEventType.Response: {
            const raw = event.body as any;
            const resp: BulkUploadResponseDto | undefined = raw ? this.mapBulkUploadResponse(raw) : undefined;
            return { progreso: 100, respuesta: resp };
          }
          default:
            return { progreso: 0 };
        }
      }),
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * GET /api/estudiantes/template
   * Descarga la plantilla oficial en formato CSV / Excel con las columnas requeridas:
   * nombres, apellidos, cedula, correo
   */
  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * GET /api/estudiantes/imports/{jobId}/result
   * Consulta el resultado detallado de un trabajo asíncrono de importación masiva
   */
  getResultadoImportacion(jobId: string): Observable<ImportJobResultDto> {
    return this.http.get<ImportJobResultDto>(`${this.apiUrl}/imports/${jobId}/result`).pipe(
      catchError((err) => throwError(() => err))
    );
  }
}
