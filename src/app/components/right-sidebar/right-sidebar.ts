import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import {
  EstudianteService,
  ActualizacionCronogramaEstudianteDto,
} from '../../services/estudiante.service';

type ActualizacionCronogramaConMateria = ActualizacionCronogramaEstudianteDto & {
  materiaId?: number | null;
  materiaNombre?: string | null;
  catedraNombre?: string | null;
};

export interface NotificacionItem {
  id: number;
  tipo: 'cronograma';
  titulo: string;
  descripcion: string;
  fecha: string;
  materiaId: number;
  materiaNombre: string;
  leida: boolean;
  actualizacionCronogramaId: number;
  catedraId: number;
  actividad: string;
  fechaAnterior: string;
  fechaNueva: string;
  observacion: string;
  fechaNotificacion: string;
}

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-sidebar.html',
})
export class RightSidebarComponent implements OnInit {
  filtro: 'todas' | 'pendientes' = 'todas';

  notificaciones: NotificacionItem[] = [];
  cargandoNotificaciones = false;
  errorNotificaciones = '';

  modalAbierto = false;
  notificacionSeleccionada: NotificacionItem | null = null;

  constructor(
    private router: Router,
    private estudianteService: EstudianteService,
  ) {}

  ngOnInit(): void {
    this.cargarCacheNotificaciones();
    this.aplicarEstadoLeidas();
    this.cargarActualizacionesCronograma();
  }

  get pendientesCount(): number {
    return this.notificaciones.filter((n) => !n.leida).length;
  }

  get notificacionesFiltradas(): NotificacionItem[] {
    return this.filtro === 'pendientes'
      ? this.notificaciones.filter((n) => !n.leida)
      : this.notificaciones;
  }

  private get usuarioCacheId(): string {
    if (typeof window === 'undefined') {
      return 'anon';
    }

    return (
      localStorage.getItem('userId') ||
      localStorage.getItem('estudianteId') ||
      localStorage.getItem('username') ||
      'anon'
    );
  }

  private get cacheNotificacionesKey(): string {
    return `sigac_notificaciones_cronograma_${this.usuarioCacheId}`;
  }

  private get leidasKey(): string {
    return `notificaciones_estudiante_leidas_${this.usuarioCacheId}`;
  }

  private cargarCacheNotificaciones(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const guardadas = localStorage.getItem(this.cacheNotificacionesKey);
      if (!guardadas) {
        return;
      }

      const cache = JSON.parse(guardadas);
      if (Array.isArray(cache)) {
        this.notificaciones = cache;
      }
    } catch {
      this.notificaciones = [];
    }
  }

  private guardarCacheNotificaciones(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.cacheNotificacionesKey, JSON.stringify(this.notificaciones));
    } catch {
      // El cache es solo una mejora de velocidad.
    }
  }

  private cargarActualizacionesCronograma(): void {
    this.errorNotificaciones = '';

    // Si ya existe cache real, se muestra inmediatamente mientras se sincroniza.
    this.cargandoNotificaciones = this.notificaciones.length === 0;

    this.estudianteService
      .getActualizacionesCronograma()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.cargandoNotificaciones = false;
        }),
      )
      .subscribe({
        next: (actualizaciones) => {
          const cambios = Array.isArray(actualizaciones) ? actualizaciones : [];

          this.notificaciones = cambios.map((cambio) =>
            this.crearAvisoCronograma(cambio as ActualizacionCronogramaConMateria),
          );

          this.aplicarEstadoLeidas();
          this.guardarCacheNotificaciones();
        },
        error: (err) => {
          // Si ya hay cache real, no vaciamos la interfaz ni mostramos un error molesto.
          if (this.notificaciones.length > 0) {
            return;
          }

          this.notificaciones = [];
          this.errorNotificaciones =
            err?.error?.message || 'No se pudieron cargar las notificaciones del cronograma.';
        },
      });
  }

  private crearAvisoCronograma(cambio: ActualizacionCronogramaConMateria): NotificacionItem {
    const materiaId = Number(cambio.materiaId || 0);

    const materiaNombre =
      cambio.materiaNombre?.trim() || cambio.catedraNombre?.trim() || `Cátedra ${cambio.catedraId}`;

    const fechaAnterior = this.formatearSoloFecha(cambio.fechaAnterior);
    const fechaNueva = this.formatearSoloFecha(cambio.fechaNueva);

    const observacion = cambio.observacion?.trim() || 'Sin observación registrada.';

    return {
      id: 1_000_000 + Number(cambio.id),
      tipo: 'cronograma',
      titulo: 'Cronograma actualizado',
      descripcion:
        `${cambio.actividad} fue reprogramada del ` + `${fechaAnterior} al ${fechaNueva}.`,
      fecha: this.formatearFechaAviso(cambio.fechaNotificacion),
      materiaId,
      materiaNombre,
      leida: false,
      actualizacionCronogramaId: Number(cambio.id),
      catedraId: Number(cambio.catedraId),
      actividad: cambio.actividad,
      fechaAnterior: cambio.fechaAnterior,
      fechaNueva: cambio.fechaNueva,
      observacion,
      fechaNotificacion: cambio.fechaNotificacion,
    };
  }

  private aplicarEstadoLeidas(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const guardadas = localStorage.getItem(this.leidasKey);
      if (!guardadas) {
        return;
      }

      const idsLeidas: number[] = JSON.parse(guardadas);

      this.notificaciones = this.notificaciones.map((n) => ({
        ...n,
        leida: idsLeidas.includes(n.id),
      }));
    } catch {
      // No afecta las notificaciones reales.
    }
  }

  private guardarEstadoLeidas(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const idsLeidas = this.notificaciones.filter((n) => n.leida).map((n) => n.id);

      localStorage.setItem(this.leidasKey, JSON.stringify(idsLeidas));

      this.guardarCacheNotificaciones();
    } catch {
      // No afecta la información de la BD.
    }
  }

  abrirNotificacion(noti: NotificacionItem): void {
    noti.leida = true;
    this.guardarEstadoLeidas();

    if (noti.materiaId > 0) {
      this.router.navigate(['/estudiante/materia', noti.materiaId], {
        queryParams: {
          actualizacionCronograma: noti.actualizacionCronogramaId,
        },
      });
      return;
    }

    this.notificacionSeleccionada = noti;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.notificacionSeleccionada = null;
  }

  toggleLeida(event: MouseEvent, noti: NotificacionItem): void {
    event.stopPropagation();
    noti.leida = !noti.leida;
    this.guardarEstadoLeidas();
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach((n) => (n.leida = true));
    this.guardarEstadoLeidas();
  }

  recargarNotificaciones(): void {
    this.cargarActualizacionesCronograma();
  }

  private formatearSoloFecha(fecha?: string | null): string {
    if (!fecha) {
      return 'Sin fecha';
    }

    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) {
      return fecha;
    }

    return valor.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatearFechaAviso(fecha?: string | null): string {
    if (!fecha) {
      return 'Actualización reciente';
    }

    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) {
      return fecha;
    }

    return valor.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
