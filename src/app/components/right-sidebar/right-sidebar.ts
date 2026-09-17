import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface NotificacionItem {
  id: number;
  tipo: 'comunicado' | 'recurso' | 'clase' | 'calificacion';
  titulo: string;
  descripcion: string;
  fecha: string;
  materiaId: number;
  materiaNombre: string;
  emisor?: string;
  contenidoCompleto?: string;
  enlaceClase?: string;
  idReunion?: string;
  codigoAcceso?: string;
  leida: boolean;
}

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './right-sidebar.html'
})
export class RightSidebarComponent implements OnInit {
  filtro: 'todas' | 'pendientes' = 'todas';

  // Notificaciones interactivas desde el backend o almacén local
  notificaciones: NotificacionItem[] = [];

  // Modal para detalle de notificación
  modalAbierto = false;
  notificacionSeleccionada: NotificacionItem | null = null;
  enlaceCopiado = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarEstadoLeidas();
  }

  get pendientesCount(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  get notificacionesFiltradas(): NotificacionItem[] {
    if (this.filtro === 'pendientes') {
      return this.notificaciones.filter(n => !n.leida);
    }
    return this.notificaciones;
  }

  cargarEstadoLeidas() {
    try {
      const guardadas = localStorage.getItem('notificaciones_estudiante_leidas');
      if (guardadas) {
        const idsLeidas: number[] = JSON.parse(guardadas);
        this.notificaciones = this.notificaciones.map(n => ({
          ...n,
          leida: idsLeidas.includes(n.id) || n.leida
        }));
      }
    } catch {
      // Ignorar error de parsing
    }
  }

  guardarEstadoLeidas() {
    try {
      const idsLeidas = this.notificaciones.filter(n => n.leida).map(n => n.id);
      localStorage.setItem('notificaciones_estudiante_leidas', JSON.stringify(idsLeidas));
    } catch {
      // Ignorar error de localStorage
    }
  }

  abrirNotificacion(noti: NotificacionItem) {
    noti.leida = true;
    this.guardarEstadoLeidas();

    if (noti.tipo === 'recurso') {
      this.router.navigate(['/estudiante/materia', noti.materiaId]);
    } else {
      this.notificacionSeleccionada = noti;
      this.enlaceCopiado = false;
      this.modalAbierto = true;
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.notificacionSeleccionada = null;
    this.enlaceCopiado = false;
  }

  toggleLeida(event: MouseEvent, noti: NotificacionItem) {
    event.stopPropagation();
    noti.leida = !noti.leida;
    this.guardarEstadoLeidas();
  }

  marcarTodasComoLeidas() {
    this.notificaciones.forEach(n => n.leida = true);
    this.guardarEstadoLeidas();
  }

  irAMateriaDesdeModal() {
    if (this.notificacionSeleccionada?.materiaId) {
      const matId = this.notificacionSeleccionada.materiaId;
      this.cerrarModal();
      this.router.navigate(['/estudiante/materia', matId]);
    }
  }

  copiarEnlaceClase() {
    if (!this.notificacionSeleccionada?.enlaceClase) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.notificacionSeleccionada.enlaceClase).then(() => {
        this.enlaceCopiado = true;
        setTimeout(() => this.enlaceCopiado = false, 3000);
      });
    } else {
      this.enlaceCopiado = true;
      setTimeout(() => this.enlaceCopiado = false, 3000);
    }
  }
}
