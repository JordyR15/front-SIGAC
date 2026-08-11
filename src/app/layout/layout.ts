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
  esAyudante: boolean = false; // Esto vendrá del backend en el futuro

  ngOnInit() {
    // Simulamos que el rol viene del localStorage (como lo guardamos en el Login)
    this.rol = localStorage.getItem('rol') || 'Estudiante';

    // Simulamos si es ayudante (en el futuro esto vendrá de una API /api/estudiante/es-ayudante)
    this.esAyudante = this.rol === 'Estudiante' && true; // Ejemplo: siempre true para pruebas
  }
}
