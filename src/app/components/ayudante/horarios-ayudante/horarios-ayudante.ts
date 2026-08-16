import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-horarios-ayudante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios-ayudante.html'
})
export class HorariosAyudanteComponent {
  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  // Clases ya ocupadas (las que ya están programadas)
  clasesOcupadas = [
    { dia: 'Lunes', horaInicio: '10:00', horaFin: '12:00' },
    { dia: 'Miércoles', horaInicio: '08:00', horaFin: '10:00' }
  ];

  // Horas seleccionadas por el ayudante para una nueva clase
  horasSeleccionadas: string[] = [];

  // Estado del selector de horas
  seleccionandoHoras = false;

  constructor(private router: Router) {}

  // Verificar si una hora está ocupada
  isHoraOcupada(hora: string, dia: string): boolean {
    return this.clasesOcupadas.some(c => c.dia === dia && c.horaInicio === hora);
  }

  // Verificar si una hora está seleccionada
  isHoraSeleccionada(hora: string): boolean {
    return this.horasSeleccionadas.includes(hora);
  }

  // Alternar selección de una hora
  toggleHora(hora: string) {
    if (this.isHoraOcupada(hora, 'Lunes')) return; // Bloquear horas ocupadas

    const index = this.horasSeleccionadas.indexOf(hora);
    if (index > -1) {
      this.horasSeleccionadas.splice(index, 1);
    } else {
      // Validar que las horas sean consecutivas
      if (this.horasSeleccionadas.length > 0) {
        const ultimaSeleccionada = this.horasSeleccionadas[this.horasSeleccionadas.length - 1];
        const indiceUltima = this.horas.indexOf(ultimaSeleccionada);
        const indiceNueva = this.horas.indexOf(hora);
        if (Math.abs(indiceNueva - indiceUltima) !== 1) {
          alert('Solo puedes seleccionar horas consecutivas.');
          return;
        }
      }
      this.horasSeleccionadas.push(hora);
    }
    // Ordenar horas seleccionadas
    this.horasSeleccionadas.sort((a, b) => this.horas.indexOf(a) - this.horas.indexOf(b));
  }

  // Crear clase con las horas seleccionadas
  crearClase() {
    if (this.horasSeleccionadas.length < 2) {
      alert('Selecciona al menos 2 horas consecutivas.');
      return;
    }
    const horaInicio = this.horasSeleccionadas[0];
    const horaFin = this.horasSeleccionadas[this.horasSeleccionadas.length - 1];
    // Simular creación de clase y redirigir a gestión de clases
    this.router.navigate(['/docente/gestion-clases']);
  }
}
