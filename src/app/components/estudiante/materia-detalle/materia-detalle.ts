import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './materia-detalle.html'
})
export class MateriaDetalleComponent implements OnInit {
  materiaId: number = 0;
  indiceTemaActual: number = 0;

  // Datos agrupados por TEMAS (simulación)
  temas = [
    {
      nombre: 'Tema 1: Introducción al Cálculo',
      recursos: [
        { id: 1, titulo: 'Guía de Estudio - Tema 1', descripcion: 'Documento PDF con teoría', url: '#', tipo: 'pdf', esEsencial: true },
        { id: 2, titulo: 'Video Explicativo', descripcion: 'Canal de YouTube', url: '#', tipo: 'video', esEsencial: false }
      ]
    },
    {
      nombre: 'Tema 2: Integrales Múltiples',
      recursos: [
        { id: 3, titulo: 'Ejercicios Resueltos', descripcion: 'PDF con ejercicios paso a paso', url: '#', tipo: 'pdf', esEsencial: true },
        { id: 4, titulo: 'Enlace a Simulador', descripcion: 'Simulador interactivo de integrales', url: '#', tipo: 'link', esEsencial: false }
      ]
    },
    {
      nombre: 'Tema 3: Aplicaciones de Integrales',
      recursos: [
        { id: 5, titulo: 'Presentación de Clase', descripcion: 'Diapositivas del tema', url: '#', tipo: 'ppt', esEsencial: false }
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.materiaId = +params['id'];
      // Siempre empezamos en el último tema (el más reciente)
      this.indiceTemaActual = this.temas.length - 1;
    });
  }

  // Navegación entre temas
  irAlTemaAnterior() {
    if (this.indiceTemaActual > 0) {
      this.indiceTemaActual--;
    }
  }

  irAlTemaSiguiente() {
    if (this.indiceTemaActual < this.temas.length - 1) {
      this.indiceTemaActual++;
    }
  }

  // Helper para obtener el ícono según el tipo de recurso
  getIconoRecurso(tipo: string): string {
    const iconos: { [key: string]: string } = {
      pdf: 'fa-regular fa-file-pdf',
      video: 'fa-regular fa-circle-play',
      link: 'fa-solid fa-link',
      ppt: 'fa-regular fa-file-powerpoint',
      imagen: 'fa-regular fa-image'
    };
    return iconos[tipo] || 'fa-regular fa-file';
  }
}
