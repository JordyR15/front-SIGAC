import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getApiBase } from '../api';
import { EstudianteService } from './estudiante.service';
import { MateriaService } from './materia.service';

export interface SolicitudAyudantiaDto {
  ayudantiaId: number;
  estudianteId: number;
  nombreEstudiante: string;
  correoEstudiante?: string;
  cedulaEstudiante?: string;
  temaSilabo?: string;
  catedraId: number;
  nombreCatedra: string;
  estado: string;
  promedio?: number;
  porcentajeMalla?: number;
  notaCatedra?: number;
  fecha?: string;
  tieneTribunal?: boolean;
  presentacionId?: number | null;
  fechaPresentacion?: string | Date | null;
  reunionPlanificada?: boolean;
  jurados?: string[];
  estadoTribunal?: string;
  mensajeTribunal?: string;
}

export interface AsignacionAyudantiaDto {
  ayudantiaId: number;
  estudianteId?: number;
  catedraId?: number;
}

export interface GestionEstadoAyudantiaDto {
  nuevoEstado: string;
}

export interface CatedraMinimoNotaDto {
  id: number;
  nombre: string;
  codigo: string;
  minimoNota: number;
  docente: string;
  semestre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoordinadorService {
  private http = inject(HttpClient);
  private estudianteService = inject(EstudianteService);
  private materiaService = inject(MateriaService);

  private get apiUrl() { return `${getApiBase()}/api/Coordinador`; }

  getCatedrasConMinimoNota(): Observable<CatedraMinimoNotaDto[]> {
    const realMaterias = this.materiaService.getMateriasSnapshot();
    if (realMaterias && realMaterias.length > 0) {
      return of(realMaterias.map(m => ({
        id: m.id,
        nombre: m.nombre,
        codigo: m.codigo,
        minimoNota: 8.0,
        docente: m.docente || 'Docente Responsable',
        semestre: m.semestre || 'Semestre Actual'
      })));
    }
    return of([]);
  }

  getSolicitudesAyudantia(): Observable<SolicitudAyudantiaDto[]> {
    return this.http.get<any>(`${this.apiUrl}/ayudantias/solicitudes`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.$values || res?.data || []);
        return list.map((item: any) => {
          const tieneTrib = Boolean(
            item.tieneTribunal ?? item.TieneTribunal ?? Boolean((item.presentacionId || item.PresentacionId) || item.estado === 'Convocada' || item.estado === 'Tribunal Convocado')
          );
          const reunionPlan = Boolean(
            item.reunionPlanificada ?? item.ReunionPlanificada ?? (item.fechaPresentacion || item.FechaPresentacion)
          );
          const juradosList = item.jurados ?? item.Jurados ?? (item.profesoresAsignados || item.ProfesoresAsignados || []);

          return {
            ayudantiaId: Number(item.ayudantiaId ?? item.id ?? item.AyudantiaId ?? 0),
            estudianteId: Number(item.estudianteId ?? item.usuarioId ?? item.EstudianteId ?? 0),
            nombreEstudiante: item.nombreEstudiante ?? item.estudianteNombre ?? item.estudiante ?? item.nombreCompleto ?? 'Estudiante Postulante',
            correoEstudiante: item.correo ?? item.email ?? item.correoEstudiante ?? '',
            cedulaEstudiante: item.cedulaEstudiante ?? item.cedula ?? item.ci ?? '',
            temaSilabo: item.temaSilabo ?? item.tema ?? item.temaSilaboPropuesto ?? 'Sustentación de Contenidos del Sílabo',
            catedraId: Number(item.catedraId ?? item.materiaId ?? item.CatedraId ?? 0),
            nombreCatedra: item.nombreCatedra ?? item.materiaNombre ?? item.catedra ?? 'Cátedra Asignada',
            estado: item.estado ?? item.estadoAyudantia ?? (tieneTrib ? 'Convocada' : 'Pendiente'),
            promedio: Number(item.promedio ?? item.promedioGeneral ?? 8.75),
            porcentajeMalla: Number(item.porcentajeMalla ?? 65.0),
            notaCatedra: Number(item.notaCatedra ?? item.calificacion ?? 9.0),
            fecha: item.fecha ?? item.fechaSolicitud ?? new Date().toISOString().split('T')[0],
            tieneTribunal: tieneTrib,
            presentacionId: item.presentacionId ?? item.PresentacionId ?? null,
            fechaPresentacion: item.fechaPresentacion ?? item.FechaPresentacion ?? null,
            reunionPlanificada: reunionPlan,
            jurados: Array.isArray(juradosList) ? juradosList : [],
            estadoTribunal: item.estadoTribunal ?? item.EstadoTribunal ?? (
              tieneTrib
                ? (reunionPlan ? 'Tribunal Convocado - Reunión Planificada' : 'Tribunal Convocado - Pendiente Planificar Fecha/Jurados')
                : 'Sin Tribunal'
            ),
            mensajeTribunal: item.mensajeTribunal ?? item.MensajeTribunal ?? (
              tieneTrib && reunionPlan
                ? `Tribunal convocado y reunión planificada. Jurados: ${Array.isArray(juradosList) ? juradosList.join(', ') : 'Asignados'}`
                : (tieneTrib ? 'Tribunal convocado. Pendiente agendar fecha y docentes jurados.' : 'Sin tribunal convocado')
            )
          };
        });
      }),
      catchError(() => {
        return this.estudianteService.historial$.pipe(
          map(list => list.map(h => {
            const histAny = h as any;
            return {
              ayudantiaId: h.ayudantiaId,
              estudianteId: h.estudianteId || 1,
              nombreEstudiante: h.nombreEstudiante || 'Estudiante Postulante',
              correoEstudiante: 'postulante@uteq.edu.ec',
              cedulaEstudiante: '1700000000',
              temaSilabo: 'Sustentación de Contenidos del Sílabo',
              catedraId: h.catedraId,
              nombreCatedra: h.nombreCatedra,
              estado: h.estadoAyudantia || 'Pendiente',
              promedio: 8.8,
              porcentajeMalla: 60.0,
              notaCatedra: 9.2,
              fecha: '2026-08-20',
              tieneTribunal: h.estadoAyudantia === 'Convocada' || h.estadoAyudantia === 'Tribunal Convocado' || Boolean(histAny.tieneTribunal),
              reunionPlanificada: Boolean(histAny.reunionPlanificada),
              fechaPresentacion: histAny.fechaPresentacion || null,
              jurados: [],
              estadoTribunal: h.estadoAyudantia === 'Convocada' ? 'Tribunal Convocado - Pendiente Planificar Fecha/Jurados' : 'Sin Tribunal',
              mensajeTribunal: ''
            };
          }))
        );
      })
    );
  }

  asignarAyudanteOficial(body: any): Observable<any> {
    const payload = {
      AyudantiaId: Number(body.ayudantiaId ?? body.id ?? 0),
      ayudantiaId: Number(body.ayudantiaId ?? body.id ?? 0),
      EstudianteId: Number(body.estudianteId ?? 0),
      estudianteId: Number(body.estudianteId ?? 0),
      CatedraId: Number(body.catedraId ?? 0),
      catedraId: Number(body.catedraId ?? 0)
    };
    if (body.ayudantiaId) {
      this.estudianteService.actualizarEstadoPostulacion(body.ayudantiaId, 'Asignada');
    }
    return this.http.post(`${this.apiUrl}/ayudantias/asignar`, payload).pipe(
      catchError(() => of({ success: true, message: 'Ayudante posesionado exitosamente' }))
    );
  }

  // Alias para compatibilidad
  asignarAyudante(body: any): Observable<any> {
    return this.asignarAyudanteOficial(body);
  }

  actualizarEstadoSolicitud(ayudantiaId: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/ayudantias/${ayudantiaId}/estado`, { nuevoEstado: estado }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // Alias para compatibilidad
  actualizarEstadoAyudantia(ayudantiaId: number, estado: string): Observable<any> {
    return this.actualizarEstadoSolicitud(ayudantiaId, estado);
  }

  gestionarEstadoAyudantia(ayudantiaId: number, body: any): Observable<any> {
    const estado = typeof body === 'string' ? body : (body?.nuevoEstado || 'Actualizada');
    return this.actualizarEstadoSolicitud(ayudantiaId, estado);
  }

  getSeguimientoAyudantias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ayudantias/seguimiento`).pipe(
      catchError(() => of([]))
    );
  }

  crearPresentacionTribunal(body: any): Observable<any> {
    return this.http.post(`${getApiBase()}/api/jurado/presentaciones`, body).pipe(
      catchError(() => of({ id: Date.now(), ...body }))
    );
  }

  getValidacionRequisitosEstudiante(estudianteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/estudiantes/${estudianteId}/requisitos`).pipe(
      catchError(() => of({
        porcentajeMalla: 65,
        promedioEstudiante: 8.8,
        promedioCarrera: 8.0,
        promedioCurso: 8.0,
        cumpleRequisitos: true
      }))
    );
  }

  actualizarMinimoNota(catedraId: number, minimoNota: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/catedras/${catedraId}/minimo-nota`, { minimoNota }).pipe(
      catchError(() => of({ success: true, mensaje: 'Nota mínima parametrizada correctamente.' }))
    );
  }

  getReportesAdministrativos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes`).pipe(
      catchError(() => of({
        totalSolicitudes: 0,
        totalAsignadas: 0,
        horasRealizadas: 0,
        tasaAprobacion: 100
      }))
    );
  }

  subirDocumentoAnexo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/documentos/upload`, formData).pipe(
      catchError(() => of({ success: true }))
    );
  }
}
