import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../api';

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  token: string;
  rol: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = `${API_BASE}/api/login/login`;
  private registerUrl = `${API_BASE}/api/login/register`;
  private personaUrl = `${API_BASE}/api/persona`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.loginUrl, credentials).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.id.toString());
        }
      })
    );
  }

  register(dto: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.registerUrl, dto).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.id.toString());
        }
      })
    );
  }

  getPersona(): Observable<any> {
    return this.http.get<any>(this.personaUrl);
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
