import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE, getApiBase } from '../api';

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  token: string;
  rol?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

export interface PersonaDto {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: string;
  telefono?: string;
  direccion?: string;
  biografia?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
<<<<<<< HEAD
=======
  private loginUrl = `${API_BASE}/api/login/login`;
  private registerUrl = `${API_BASE}/api/login/register`;
  private personaUrl = `${API_BASE}/api/persona`;


>>>>>>> 2a01521b428953a8e18219a16df5623c42a6605c
  constructor(private http: HttpClient) {}

  private get loginUrl() { return `${getApiBase()}/api/Login/login`; }
  private get registerUrl() { return `${getApiBase()}/api/Login/register`; }
  private get personaUrl() { return `${getApiBase()}/api/persona`; }

  login(credentials: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.loginUrl, credentials).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol || '');
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.id ? response.id.toString() : '');
          if (response.nombre) localStorage.setItem('nombre', response.nombre);
          if (response.apellido) localStorage.setItem('apellido', response.apellido);
          if (response.correo) localStorage.setItem('correo', response.correo);
        }
      })
    );
  }

  register(dto: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.registerUrl, dto).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol || '');
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.id ? response.id.toString() : '');
          if (response.nombre) localStorage.setItem('nombre', response.nombre);
          if (response.apellido) localStorage.setItem('apellido', response.apellido);
          if (response.correo) localStorage.setItem('correo', response.correo);
        }
      })
    );
  }

  getPersona(): Observable<PersonaDto> {
    return this.http.get<PersonaDto>(this.personaUrl);
  }

  updatePersona(persona: Partial<PersonaDto>): Observable<PersonaDto> {
    return this.http.put<PersonaDto>(this.personaUrl, persona);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }
}
