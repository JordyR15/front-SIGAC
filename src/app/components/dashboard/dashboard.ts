import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare const Plotly: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // 1. Obtenemos el rol del usuario
  rol = localStorage.getItem('rol') || 'Estudiante';

  // 2. Datos del Estudiante (los que ya tenías)
  materiasEstudiante = [
    {
      id: 1,
      catedraId: 101,
      catedra: { id: 101, nombre: 'Cálculo Avanzado', docente: { username: 'Dra. Evelyn Vance' } },
      promedioActual: 4.8,
      alertaRendimiento: false
    },
    {
      id: 2,
      catedraId: 102,
      catedra: { id: 102, nombre: 'Mecánica Cuántica', docente: { username: 'Dr. Marcus Thorne' } },
      promedioActual: 4.5,
      alertaRendimiento: false
    },
    {
      id: 3,
      catedraId: 103,
      catedra: { id: 103, nombre: 'Redes Neuronales', docente: { username: 'Prof. Sarah Chen' } },
      promedioActual: 4.9,
      alertaRendimiento: false
    }
  ];

  // 3. Datos del Ayudante / Docente (Nuevos KPIs)
  dashboardAyudante = {
    estudiantes: 25,
    clasesImpartidas: 8,
    promedioAsistencia: 92,
    proximasClases: [
      { titulo: 'Clase Virtual - Cálculo Avanzado', descripcion: 'Zoom - 10:00 AM (Mañana)', ruta: '/docente/gestion-clases' },
      { titulo: 'Clase Presencial - Mecánica Cuántica', descripcion: 'Aula 301 - 14:00 PM (Viernes)', ruta: '/docente/gestion-clases' }
    ]
  };

  ngOnInit(): void {
    // Solo renderizamos el gráfico si es Estudiante
    if (this.rol === 'Estudiante') {
      this.renderChart();
    }
  }

  renderChart() {
    const data = [
      {
        x: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
        y: [4.2, 4.4, 4.3, 4.5, 4.7, 4.6, 4.8, 4.84],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Tu Promedio',
        line: { color: '#2563eb', width: 3, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: 'rgba(37, 99, 235, 0.05)'
      },
      {
        x: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
        y: [3.8, 3.9, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2],
        type: 'scatter',
        mode: 'lines',
        name: 'Promedio Grupal',
        line: { color: '#94a3b8', width: 2, dash: 'dot', shape: 'spline' }
      }
    ];

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: 10, r: 10, b: 40, l: 40 },
      showlegend: false,
      xaxis: { gridcolor: '#f1f5f9', tickfont: { color: '#94a3b8', size: 10 }, linecolor: '#f1f5f9' },
      yaxis: { gridcolor: '#f1f5f9', tickfont: { color: '#94a3b8', size: 10 }, range: [3.0, 5.0], dtick: 0.5 },
      hovermode: 'x unified',
      hoverlabel: { bgcolor: '#ffffff', bordercolor: '#e2e8f0', font: { color: '#0f172a' } }
    };

    const config = { responsive: true, displayModeBar: false, displaylogo: false };
    Plotly.newPlot('trajectory-chart', data, layout, config);
  }
}
