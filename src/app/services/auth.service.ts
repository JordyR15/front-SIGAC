import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// DTOs mapeados desde C#
export interface LoginDto {
  username: string;
  password: string;
}

export interface UserDto {
  username: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta el puerto según donde corra tu API C# (.NET suele usar http://localhost:5000 o https://localhost:7---)
  private apiUrl = 'http://localhost:5000/api/login';

  constructor(private http: HttpClient) {}

  login(credentials: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, credentials).pipe(
      tap((response: UserDto) => {
        if (response && response.token) {
          // Guardar el token en el almacenamiento local del navegador
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
