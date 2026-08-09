import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Estado del formulario
  isLoading = false;
  errorMessage = '';

  // DTO de login en el frontend
  credentials = {
    email: '',
    password: ''
  };

  onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Intentando iniciar sesión con:', this.credentials);

    // Simulación temporal mientras creas el backend en C#
    setTimeout(() => {
      this.isLoading = false;
      // Aquí redirigirás cuando la respuesta sea exitosa
      // this.router.navigate(['/dashboard']);
    }, 1500);
  }
}
