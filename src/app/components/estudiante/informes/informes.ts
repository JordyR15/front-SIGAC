import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informes.html'
})
export class InformesComponent {
  // Mock: Lista de ayudantías activas
  ayudantias = [
    { id: 1, nombre: 'Ayudantía - Cálculo Avanzado' },
    { id: 2, nombre: 'Ayudantía - Mecánica Cuántica' }
  ];

  // Filtros para el informe (coinciden con los query params de C#)
  filtro = {
    ayudantiaId: 0,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  };

  // Mock del resultado (cuando el backend exista, esto se llenará con datos reales)
  actividadesMock = [
    { fecha: '2026-08-15', actividadesRealizadas: 'Sesión de repaso de 2 horas', evidenciaUrl: '#' },
    { fecha: '2026-08-12', actividadesRealizadas: 'Tutoría personalizada de 1 hora', evidenciaUrl: '#' }
  ];

  generarInforme() {
    console.log('Generando informe con filtros:', this.filtro);
    // Cuando el backend exista:
    // this.http.get(`api/estudiante/ayudantias/informe-mensual?ayudantiaId=${this.filtro.ayudantiaId}&mes=${this.filtro.mes}&anio=${this.filtro.anio}`)
  }
}
