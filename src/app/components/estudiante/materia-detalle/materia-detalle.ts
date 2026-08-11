import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materia-detalle.html'
})
export class MateriaDetalleComponent implements OnInit {
  materiaId: number = 0;

  // Mock de datos de la materia (esto vendrá del backend)
  materia = {
    id: 0,
    nombre: '',
    recursos: [
      { id: 1, titulo: 'Guía de Estudio - Tema 1', descripcion: 'Documento PDF con teoría', url: '#', esEsencial: true, visto: false },
      { id: 2, titulo: 'Video Explicativo', descripcion: 'Canal de YouTube', url: '#', esEsencial: false, visto: false }
    ],
    actividades: [
      { id: 1, titulo: 'Tarea 1', descripcion: 'Resolver ejercicios del capítulo 3', fechaEntrega: '2026-08-20', tipo: 'Tarea', estado: 'Pendiente' }
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtenemos el ID de la materia desde la URL
    this.route.params.subscribe(params => {
      this.materiaId = +params['id'];
      // Aquí se haría la llamada al backend: GET /api/materias/{id}
      console.log('Cargando materia con ID:', this.materiaId);
      this.materia.id = this.materiaId;
      this.materia.nombre = 'Materia Cargada'; // Mock
    });
  }
}
