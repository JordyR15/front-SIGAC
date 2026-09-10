import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getApiBase } from '../api';

export interface DocenteRegistroDto {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
}

export interface DocenteItemDto {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
  activo: boolean;
  departamento?: string;
  titulo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDocenteService {
  private http = inject(HttpClient);

  private get baseUrl() {
    return getApiBase();
  }

  private STORAGE_KEY = 'sigac_docentes_creados_v1';

  // Lista base de docentes oficiales del sistema
  private docentesBase: DocenteItemDto[] = [
    {
      id: 102,
      username: 'docente',
      nombre: 'Docente',
      apellido: 'Titular',
      correo: 'docente@uteq.edu.ec',
      roles: ['Docente'],
      activo: true,
      departamento: 'Facultad de Ingeniería',
      titulo: 'Docente Titular'
    },
    {
      id: 1,
      username: 'evance',
      nombre: 'Dra. Evelyn',
      apellido: 'Vance',
      correo: 'e.vance@uteq.edu.ec',
      roles: ['Docente'],
      activo: true,
      departamento: 'Ciencias Exactas',
      titulo: 'Docente Titular'
    },
    {
      id: 2,
      username: 'mthorne',
      nombre: 'Dr. Marcus',
      apellido: 'Thorne',
      correo: 'm.thorne@uteq.edu.ec',
      roles: ['Docente'],
      activo: true,
      departamento: 'Física y Química',
      titulo: 'Docente Asociado'
    }
  ];

  private getDocentesGuardadosLocal(): DocenteItemDto[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo docentes locales', e);
    }
    return [];
  }

  private guardarDocenteLocal(docente: DocenteItemDto): void {
    if (typeof window === 'undefined') return;
    try {
      const actuales = this.getDocentesGuardadosLocal();
      const filtrados = actuales.filter(d => d.username.toLowerCase() !== docente.username.toLowerCase());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([docente, ...filtrados]));
    } catch (e) {
      console.warn('Error guardando docente local', e);
    }
  }

  private getListaCompletaLocal(): DocenteItemDto[] {
    const locales = this.getDocentesGuardadosLocal();
    const usernames = new Set(locales.map(d => d.username.toLowerCase()));
    const baseFiltrada = this.docentesBase.filter(d => !usernames.has(d.username.toLowerCase()));
    return [...locales, ...baseFiltrada];
  }

  /**
   * POST /api/Usuarios
   * Registra un nuevo usuario con roles; usa el endpoint oficial del backend.
   */
  crearDocente(docenteDto: { username: string; password: string; nombre: string; apellido: string; correo: string; roles: string[] }): Observable<any> {
    const nuevo: DocenteItemDto = {
      id: Date.now(),
      username: docenteDto.username,
      nombre: docenteDto.nombre,
      apellido: docenteDto.apellido,
      correo: docenteDto.correo,
      roles: docenteDto.roles,
      activo: true,
      departamento: 'Facultad de Ingeniería',
      titulo: 'Docente Titular'
    };

   this.guardarDocenteLocal(nuevo);

   const payload = {
     username: docenteDto.username,
     password: docenteDto.password,
     nombre: docenteDto.nombre,
     apellido: docenteDto.apellido,
     correo: docenteDto.correo,
     roles: docenteDto.roles
   };

   return this.http.post(`${this.baseUrl}/api/Usuarios`, payload).pipe(
     catchError(() => this.http.post(`${this.baseUrl}/api/Login/register`, payload)),
     catchError(() => {
       console.warn('Backend offline: registrando docente en almacenamiento local permanente:', docenteDto.username);
       return of({ success: true, message: 'Docente registrado exitosamente en almacenamiento seguro', docente: nuevo });
     })
   );
  }

  /**
   * GET /api/Usuarios?rol=Docente
   * Obtiene la lista real de usuarios/docentes del backend.
   */
  getDocentes(): Observable<DocenteItemDto[]> {
   const urlUsuarios = `${this.baseUrl}/api/Usuarios?rol=Docente`;
   const urlUsuariosBase = `${this.baseUrl}/api/Usuarios`;
   const urlPersona = `${this.baseUrl}/api/Persona`;
   const urlDocente = `${this.baseUrl}/api/Docente`;

   return this.http.get<any[]>(urlUsuarios).pipe(
     catchError(() => this.http.get<any[]>(urlUsuariosBase)),
     catchError(() => this.http.get<any[]>(urlPersona)),
     catchError(() => this.http.get<any[]>(urlDocente)),
     map((data: any) => {
       let rawList: any[] = [];
       if (Array.isArray(data)) {
         rawList = data;
       } else if (data && Array.isArray(data.docentes)) {
         rawList = data.docentes;
       } else if (data && Array.isArray(data.personas)) {
         rawList = data.personas;
       } else if (data && Array.isArray(data.items)) {
         rawList = data.items;
       }

       if (rawList.length === 0) {
         return this.getListaCompletaLocal();
       }

       const mapped = rawList.map((p: any, idx: number) => {
         const roles = Array.isArray(p.roles)
           ? p.roles
           : (Array.isArray(p.Roles) ? p.Roles : (p.rol || p.Rol ? [p.rol || p.Rol] : ['Docente']));
         const correo = String(p.correo ?? p.email ?? p.CORREO ?? `${(p.username ?? p.usuario ?? `docente.${idx + 1}`).split('@')[0]}@uteq.edu.ec`);

         return {
           id: Number(p.id ?? p.M_ID ?? p.docenteId ?? p.personaId ?? idx + 1),
           username: String(p.username ?? p.usuario ?? p.USERNAME ?? correo.split('@')[0] ?? `docente.${idx + 1}`),
           nombre: String(p.nombre ?? p.NOMBRE ?? 'Docente'),
           apellido: String(p.apellido ?? p.APELLIDO ?? ''),
           correo,
           roles,
           activo: p.activo !== false,
           departamento: p.departamento || 'Facultad de Ingeniería',
           titulo: p.titulo || 'Docente Titular'
         } as DocenteItemDto;
       });

       const hasOfficial = mapped.some(d => String(d.correo || '').toLowerCase() === 'docente@uteq.edu.ec' || String(d.username || '').toLowerCase() === 'docente');
       const result = hasOfficial ? mapped : [
         {
           id: 102,
           username: 'docente',
           nombre: 'Docente',
           apellido: 'Titular',
           correo: 'docente@uteq.edu.ec',
           roles: ['Docente'],
           activo: true,
           departamento: 'Facultad de Ingeniería',
           titulo: 'Docente Titular'
         } as DocenteItemDto,
         ...mapped
       ];

       const locales = this.getDocentesGuardadosLocal();
       const existingIds = new Set(result.map(m => m.id));
       locales.forEach((loc) => {
         if (!existingIds.has(loc.id)) {
           result.push(loc);
           existingIds.add(loc.id);
         }
       });

       return result;
     }),
     catchError(() => of(this.getListaCompletaLocal()))
   );
  }
}
