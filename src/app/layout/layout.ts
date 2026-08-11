import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  rol: string = '';

  ngOnInit() {
    // Simulamos que el rol viene del localStorage (como lo guardamos en el Login)
    this.rol = localStorage.getItem('rol') || 'Estudiante';
  }
}
