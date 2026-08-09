import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html', // <-- Quitar ".component" para que coincida con el nombre real de tu archivo
  styleUrl: './login.css'     // <-- Verificar que también se llame login.css
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Modelo ligado al formulario
  // src/app/components/login/login.component.ts

  credentials = {
    email: '',
    password: ''
  };

  // Variables de estado para la UI
  isLoading = false;
  errorMessage = '';

  onLogin(): void {
    // Validar campos básicos
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, ingrese el usuario y la contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.token) {
          // Guardar token JWT en localStorage
          this.authService.saveToken(response.token);
          // Redirigir a la pantalla principal o dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Credenciales incorrectas.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de autenticación:', error);
        this.errorMessage = error.error?.message || 'Error al conectar con el servidor. Intente más tarde.';
      }
    });
  }
}
