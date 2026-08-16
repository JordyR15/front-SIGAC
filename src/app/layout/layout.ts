import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RightSidebarComponent } from '../components/right-sidebar/right-sidebar';
import { RightSidebarAyudanteComponent } from '../components/ayudante/right-sidebar-ayudante/right-sidebar-ayudante'; // <-- IMPORTADO

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RightSidebarComponent,
    RightSidebarAyudanteComponent  // <-- AGREGADO AL IMPORTS
  ],
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

  cambiarRol(nuevoRol: string) {
    this.rol = nuevoRol;
    localStorage.setItem('rol', nuevoRol);
    this.actualizarEstadoAyudante();
    window.location.reload();
  }

  actualizarEstadoAyudante() {
    this.esAyudante = this.rol === 'Ayudante';
  }
}
