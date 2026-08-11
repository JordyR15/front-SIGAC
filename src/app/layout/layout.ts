import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 1. IMPORTA EL RIGHT SIDEBAR AQUÍ
import { RightSidebarComponent } from '../components/right-sidebar/right-sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  // 2. AGREGA RightSidebarComponent EN EL ARRAY imports
  imports: [CommonModule, RouterModule, RightSidebarComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  rol: string = '';

  ngOnInit() {
    this.rol = localStorage.getItem('rol') || 'Estudiante';
  }
}
