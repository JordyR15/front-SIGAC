import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-clase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-clase.html'
})
export class CrearClaseComponent {
  nuevaClase = {
    nombre: '',
    semestre: '',
    descripcion: ''
  };

  constructor(private router: Router) {}

  guardarClase() {
    if (!this.nuevaClase.nombre || !this.nuevaClase.semestre) {
      alert('Por favor, completa el nombre y el semestre.');
      return;
    }
    console.log('Creando clase:', this.nuevaClase);
    // Simulación de guardado. En el futuro, el backend devolverá un ID.
    alert('Clase creada exitosamente. Ahora puedes añadir materias.');
    // Redirigir a la pantalla de gestión de materias de esa clase
    this.router.navigate(['/admin/clases']);
  }
}
