import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html'
})
export class MiPerfilComponent {
  // Mock alineado con PersonaDto y UserDto
  perfil = {
    username: 'estudiante01',
    nombre: 'Alejandro',
    apellido: 'García',
    correo: 'alejandro.garcia@institucion.edu',
    rol: 'Estudiante',
    semestre: 'Otoño 2024',
    creditosAprobados: 114
  };

  guardarCambios() {
    console.log('Guardando cambios del perfil:', this.perfil);
    // Cuando el backend exista: this.http.put('api/persona', this.perfil)
  }
}
