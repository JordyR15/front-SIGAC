import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RightSidebarComponent } from '../components/right-sidebar/right-sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RightSidebarComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  rol: string = '';
  esAyudante: boolean = false;

  ngOnInit() {
    this.rol = localStorage.getItem('rol') || 'Estudiante';
    this.actualizarEstadoAyudante();
  }

  // Método para cambiar el rol rápidamente desde el Header
  cambiarRol(nuevoRol: string) {
    this.rol = nuevoRol;
    localStorage.setItem('rol', nuevoRol);
    this.actualizarEstadoAyudante();

    // Recargar la página para que el menú se actualice completamente
    window.location.reload();
  }

  // Método auxiliar para actualizar el estado de ayudante
  actualizarEstadoAyudante() {
    // Si el rol seleccionado es 'Ayudante', lo ponemos como true
    this.esAyudante = this.rol === 'Ayudante';
  }
}
