import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-materia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-materia.html'
})
export class CrearMateriaComponent {
  // Simulación: lista de docentes registrados en el sistema
  docentes = [
    { id: 1, nombre: 'Dra. Evelyn Vance' },
    { id: 2, nombre: 'Dr. Marcus Thorne' },
    { id: 3, nombre: 'Prof. Sarah Chen' }
  ];

  nuevaMateria = {
    nombre: '',
    codigo: '',
    descripcion: '',
    docenteResponsableId: 0 // <-- El administrador elige al docente
  };

  guardarMateria() {
    if (!this.nuevaMateria.nombre || !this.nuevaMateria.codigo || !this.nuevaMateria.docenteResponsableId) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    console.log('Creando materia:', this.nuevaMateria);
    alert('Materia creada exitosamente.');
  }
}
