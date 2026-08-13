import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ⚠️ CAMBIA EL PUERTO SEGÚN DONDE CORRA TU BACKEND (5000, 7123, etc.)
  private apiUrl = 'http://localhost:5291/api/login';
  constructor(private http: HttpClient) {}

  login(credentials: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, credentials).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('username', response.username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
}
