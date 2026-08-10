import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// DTOs mapeados desde C# (LoginController.cs devuelve UserDto con Rol)
export interface LoginDto {
  username: string;
  password: string;
}

export interface UserDto {
  username: string;
  token: string;
  rol: string; // <-- AGREGADO
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/login';

  constructor(private http: HttpClient) {}

  login(credentials: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, credentials).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('rol', response.rol); // <-- GUARDAMOS EL ROL
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }
}
