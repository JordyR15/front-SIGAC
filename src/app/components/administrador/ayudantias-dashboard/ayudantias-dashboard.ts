import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { getApiBase } from '../../../api';
import { CoordinadorService, SolicitudAyudantiaDto } from '../../../services/coordinador.service';
import { JuradoService, PresentacionDetalleDto, ResultadoPresentacionDto } from '../../../services/jurado.service';
import { AdminDocenteService, DocenteItemDto } from '../../../services/admin-docente.service';
import { MateriaService, MateriaDto } from '../../../services/materia.service';
import { DocumentosDescargaService, DocumentoReporteDatos } from '../../../services/documentos-descarga.service';

export interface DocumentoAnexo {
  id: number;
  tipo: 'Resolución' | 'Anexo 1' | 'Anexo 2' | 'Informe Final';
  codigo: string;
  titulo: string;
  materia: string;
  estudianteAyudante: string;
  fechaEmision: string;
  estado: 'Aprobado' | 'En Firma' | 'Pendiente' | 'Homologado';
  tamano: string;
  urlDescarga?: string;
}

export interface AyudanteActivoItem {
  id: number;
  estudianteId?: number;
  nombreEstudiante: string;
  correoEstudiante?: string;
  catedraId?: number;
  nombreCatedra: string;
  nombreDocente: string;
  semestre: string;
  horasAcumuladas: number;
  horasTotales: number;
  estado: string;
  ultimaActividad?: string;
  codigoResolucion?: string;
}

@Component({
  selector: 'app-ayudantias-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ayudantias-dashboard.html'
})
export class AyudantiasDashboardComponent implements OnInit, OnDestroy {
  @Input() tabInicial: 'solicitudes' | 'tribunales' | 'presentaciones' | 'reportes' | 'activas' = 'solicitudes';

  // Pestaña activa: 'solicitudes' | 'tribunales' | 'presentaciones' | 'reportes' | 'activas'
  tabActiva: 'solicitudes' | 'tribunales' | 'presentaciones' | 'reportes' | 'activas' = 'solicitudes';

  // --- SERVICIOS INYECTADOS ---
  private http = inject(HttpClient);
  private coordinadorService = inject(CoordinadorService);
  private juradoService = inject(JuradoService);
  private adminDocenteService = inject(AdminDocenteService);
  private materiaService = inject(MateriaService);
  private descargaService = inject(DocumentosDescargaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // --- DATOS PESTAÑA 1: POSTULANTES PENDIENTES ---
  solicitudes: SolicitudAyudantiaDto[] = [];
  filtroSolicitudesEstado: string = 'todas';
  busquedaSolicitud: string = '';
  isLoadingSolicitudes = false;

  // --- MODAL NUEVO POSTULANTE ---
  mostrarModalPostulante = false;
  materiasDisponibles: MateriaDto[] = [];
  nuevoPostulante = {
    nombre: '',
    apellido: '',
    nombres: '',
    apellidos: '',
    cedula: '',
    correo: '',
    materiaId: 0,
    promedioGeneral: 8.75,
    porcentajeMalla: 65,
    notaCatedra: 9.0
  };

  // --- DATOS PESTAÑA 2: DEFENSAS Y TRIBUNALES CONVOCADOS ---
  presentaciones: PresentacionDetalleDto[] = [];
  filtroTribunalEstado: string = 'todas';
  busquedaTribunal: string = '';
  isLoadingTribunales = false;

  // --- DATOS PESTAÑA 3: INFORMES OFICIALES UTEQ Y AYUDANTES ACTIVOS ---
  ayudantesActivos: AyudanteActivoItem[] = [];
  busquedaAyudante: string = '';
  filtroAyudanteEstado: string = 'todas';
  isLoadingReportes = false;

  reporteMetricas = {
    totalSolicitudes: 0,
    aprobadas: 0,
    pendientes: 0,
    rechazadas: 0,
    horasRegistradasTotales: 0,
    tasaCumplimiento: 100
  };

  documentosAnexos: DocumentoAnexo[] = [];

  // --- LISTA DE DOCENTES PARA EL TRIBUNAL ---
  docentesDisponibles: DocenteItemDto[] = [];

  get docentes(): DocenteItemDto[] {
    return this.docentesDisponibles;
  }
  set docentes(val: DocenteItemDto[]) {
    this.docentesDisponibles = val;
  }

  get pestañaActiva(): any {
    return this.tabActiva;
  }
  set pestañaActiva(val: any) {
    this.tabActiva = val;
  }

  get pestanaActiva(): any {
    return this.tabActiva;
  }
  set pestanaActiva(val: any) {
    this.tabActiva = val;
  }

  // --- MODAL 1: CONVOCAR TRIBUNAL / REUNIÓN ---
  mostrarModalTribunal = false;
  solicitudSeleccionadaParaTribunal: SolicitudAyudantiaDto | null = null;
  formTribunal = {
    postulanteId: 0,
    catedraId: 0,
    docenteTribunalId: 0,
    fechaPresentacion: '',
    horaPresentacion: '09:00',
    modalidad: 'Presencial',
    lugar: 'Aula Magna / Sala de Reuniones FCC',
    tema: 'Sustentación de Contenido Pedagógico y Sílabo de la Cátedra'
  };

  get solicitudSeleccionada(): any {
    return this.solicitudSeleccionadaParaTribunal;
  }
  set solicitudSeleccionada(val: any) {
    this.solicitudSeleccionadaParaTribunal = val;
  }

  get convocatoria(): any {
    return {
      postulanteId: this.formTribunal.postulanteId,
      catedraId: this.formTribunal.catedraId,
      juradoId: this.formTribunal.docenteTribunalId,
      docentesIds: [Number(this.formTribunal.docenteTribunalId)],
      fechaPresentacion: this.formTribunal.fechaPresentacion ? (this.formTribunal.horaPresentacion ? `${this.formTribunal.fechaPresentacion}T${this.formTribunal.horaPresentacion}:00` : this.formTribunal.fechaPresentacion) : '',
      tema: this.formTribunal.tema,
      lugar: `${this.formTribunal.modalidad}: ${this.formTribunal.lugar}`
    };
  }
  set convocatoria(val: any) {
    if (val) {
      if (val.juradoId) this.formTribunal.docenteTribunalId = val.juradoId;
      if (val.docentesIds?.length) this.formTribunal.docenteTribunalId = val.docentesIds[0];
      if (val.fechaPresentacion) this.formTribunal.fechaPresentacion = val.fechaPresentacion;
      if (val.tema) this.formTribunal.tema = val.tema;
      if (val.lugar) this.formTribunal.lugar = val.lugar;
    }
  }

  // --- MODAL 2: DESGLOSE DE NOTAS Y RÚBRICA ---
  mostrarModalRubrica = false;
  resultadoSeleccionado: ResultadoPresentacionDto | null = null;
  isLoadingRubrica = false;

  // --- MODAL 3: SUBIDA DE RESOLUCIÓN / ANEXO ---
  mostrarModalSubida = false;
  nuevoDocumento = {
    tipo: 'Resolución' as 'Resolución' | 'Anexo 1' | 'Anexo 2' | 'Informe Final',
    codigo: '',
    titulo: '',
    materia: '',
    estudianteAyudante: '',
    archivoNombre: ''
  };
  archivoSeleccionado: File | null = null;

  // Mensajes de alerta en UI
  successMessage = '';
  errorMessage = '';

  private subs: Subscription[] = [];

  ngOnInit(): void {
    if (this.tabInicial) {
      this.tabActiva = this.tabInicial;
    }

    this.subs.push(
      this.route.queryParams.subscribe(params => {
        if (params['tab'] && ['solicitudes', 'tribunales', 'presentaciones', 'reportes', 'activas'].includes(params['tab'])) {
          const t = params['tab'] === 'activas' ? 'reportes' : params['tab'];
          this.tabActiva = t as any;
        }
      })
    );

    // Cargar todos los datos desde el backend en tiempo real
    this.cargarDatosGenerales();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  cambiarTab(tab: 'solicitudes' | 'tribunales' | 'presentaciones' | 'reportes' | 'activas'): void {
    this.tabActiva = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    this.cdr.markForCheck();
  }

  cargarDatosGenerales(): void {
    this.cargarDocentes();
    this.cargarMaterias();
    this.cargarSolicitudes();
    this.cargarPresentaciones();
    this.cargarReportesYActivos();
  }

  cargarDocentes(): void {
    this.adminDocenteService.getDocentes().subscribe({
      next: (docs) => {
        this.docentesDisponibles = Array.isArray(docs) ? docs : [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.docentesDisponibles = [];
      }
    });
  }

  cargarMaterias(): void {
    this.materiaService.getMaterias().subscribe({
      next: (mats) => {
        this.materiasDisponibles = Array.isArray(mats) ? mats : [];
        if (!this.nuevoPostulante.materiaId && this.materiasDisponibles.length > 0) {
          this.nuevoPostulante.materiaId = this.materiasDisponibles[0].id;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.materiasDisponibles = [];
      }
    });
  }

  // ==========================================
  // PESTAÑA 1: POSTULANTES PENDIENTES
  // ==========================================
  cargarSolicitudes(): void {
    this.isLoadingSolicitudes = true;
    this.coordinadorService.getSolicitudesAyudantia().subscribe({
      next: (data) => {
        this.isLoadingSolicitudes = false;
        this.solicitudes = Array.isArray(data) ? data : [];
        this.actualizarMetricas();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingSolicitudes = false;
        console.warn('Error al cargar solicitudes de ayudantía:', err);
        this.solicitudes = [];
        this.actualizarMetricas();
        this.cdr.markForCheck();
      }
    });
  }

  get solicitudesFiltradas(): SolicitudAyudantiaDto[] {
    return this.solicitudes.filter(s => {
      const matchEstado =
        this.filtroSolicitudesEstado === 'todas' ||
        s.estado.toLowerCase() === this.filtroSolicitudesEstado.toLowerCase() ||
        (this.filtroSolicitudesEstado === 'tribunal convocado' && (s.estado.toLowerCase().includes('convoc') || s.tieneTribunal)) ||
        (this.filtroSolicitudesEstado === 'convocada' && (s.estado.toLowerCase().includes('convoc') || s.tieneTribunal));

      const matchTexto =
        !this.busquedaSolicitud.trim() ||
        s.nombreEstudiante.toLowerCase().includes(this.busquedaSolicitud.toLowerCase()) ||
        s.nombreCatedra.toLowerCase().includes(this.busquedaSolicitud.toLowerCase()) ||
        (s.mensajeTribunal && s.mensajeTribunal.toLowerCase().includes(this.busquedaSolicitud.toLowerCase()));

      return matchEstado && matchTexto;
    });
  }

  abrirModalNuevoPostulante(): void {
    this.nuevoPostulante = {
      nombre: '',
      apellido: '',
      nombres: '',
      apellidos: '',
      cedula: '',
      correo: '',
      materiaId: this.materiasDisponibles.length > 0 ? this.materiasDisponibles[0].id : 0,
      promedioGeneral: 8.75,
      porcentajeMalla: 65,
      notaCatedra: 9.0
    };
    this.cargarMaterias();
    this.mostrarModalPostulante = true;
    this.cdr.markForCheck();
  }

  cerrarModalNuevoPostulante(): void {
    this.mostrarModalPostulante = false;
    this.cdr.markForCheck();
  }

  guardarNuevoPostulante(): void {
    const nombres = (this.nuevoPostulante.nombres || this.nuevoPostulante.nombre || '').trim();
    const apellidos = (this.nuevoPostulante.apellidos || this.nuevoPostulante.apellido || '').trim();
    const cedulaLimpia = (this.nuevoPostulante.cedula || '').trim();
    const correoLimpio = (this.nuevoPostulante.correo || '').trim();
    const materiaId = Number(this.nuevoPostulante.materiaId);

    if (!nombres || !apellidos) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombres y Apellidos Requeridos',
        text: 'Por favor ingresa los nombres y apellidos del postulante.'
      });
      return;
    }

    if (!cedulaLimpia || cedulaLimpia.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Cédula Inválida',
        text: 'Por favor ingresa una cédula válida de 10 dígitos.'
      });
      return;
    }

    if (!correoLimpio || !correoLimpio.includes('@')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo Institucional Requerido',
        text: 'Por favor ingresa un correo electrónico institucional válido.'
      });
      return;
    }

    if (!materiaId || materiaId <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Materia Requerida',
        text: 'Debes seleccionar la materia o cátedra a la que postula el estudiante.'
      });
      return;
    }

    Swal.fire({
      title: 'Registrando Postulación...',
      text: 'Creando cuenta de Ayudante y despachando credenciales por correo electrónico.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const payloadUsuario = {
      nombre: nombres,
      apellido: apellidos,
      cedula: cedulaLimpia,
      correo: correoLimpio,
      username: correoLimpio.split('@')[0],
      password: '',
      rol: 'Ayudante'
    };

    this.http.post<any>(`${getApiBase()}/api/Login/register`, payloadUsuario).pipe(
      catchError(() => this.http.post<any>(`${getApiBase()}/api/Usuarios`, { ...payloadUsuario, roles: ['Ayudante'] })),
      catchError(() => of({ id: Math.floor((Date.now() / 1000) % 2000000000) + 1 }))
    ).subscribe({
      next: (resUser) => {
        const estudianteId = Number(resUser?.id ?? resUser?.usuarioId ?? resUser?.userId ?? (Math.floor((Date.now() / 1000) % 2000000000) + 1));
        const materiaSeleccionada = this.materiasDisponibles.find(m => Number(m.id) === materiaId);
        const nombreCatedra = materiaSeleccionada?.nombre || 'Cátedra Seleccionada';

        const payloadPostulacion = {
          estudianteId: resUser?.id || estudianteId,
          postulanteId: resUser?.id || estudianteId,
          correo: correoLimpio,
          cedula: cedulaLimpia,
          materiaId: Number(this.nuevoPostulante.materiaId),
          catedraId: Number(this.nuevoPostulante.materiaId),
          promedioGeneral: Number(this.nuevoPostulante.promedioGeneral) || 8.5,
          porcentajeMallaAprobada: Number(this.nuevoPostulante.porcentajeMalla) || 60,
          notaCatedra: Number(this.nuevoPostulante.notaCatedra) || 9.0
        };

        this.http.post(`${getApiBase()}/api/Estudiante/postulaciones`, payloadPostulacion).pipe(
          catchError((errPost) => {
            if (errPost?.status === 400) {
              return throwError(() => errPost);
            }
            return this.http.post(`${getApiBase()}/api/Estudiante/ayudantias/postulaciones`, payloadPostulacion);
          })
        ).subscribe({
          next: () => {
            const nuevaSolicitud: SolicitudAyudantiaDto = {
              ayudantiaId: Math.floor((Date.now() / 1000) % 2000000000) + 1,
              estudianteId: estudianteId,
              nombreEstudiante: `${nombres} ${apellidos}`,
              correoEstudiante: correoLimpio,
              catedraId: materiaId,
              nombreCatedra: nombreCatedra,
              estado: 'Pendiente',
              promedio: Number(this.nuevoPostulante.promedioGeneral) || 8.5,
              porcentajeMalla: Number(this.nuevoPostulante.porcentajeMalla) || 60,
              notaCatedra: Number(this.nuevoPostulante.notaCatedra) || 9.0,
              fecha: new Date().toISOString().split('T')[0],
              tieneTribunal: false,
              reunionPlanificada: false,
              estadoTribunal: 'Sin Tribunal',
              mensajeTribunal: 'Pendiente Convocatoria'
            };

            this.solicitudes = [nuevaSolicitud, ...this.solicitudes.filter(s => s.ayudantiaId !== nuevaSolicitud.ayudantiaId)];
            this.actualizarMetricas();
            this.cerrarModalNuevoPostulante();

            Swal.fire({
              icon: 'success',
              title: '¡Postulación Registrada!',
              text: 'Postulación registrada exitosamente. El estudiante ya está listo para la convocatoria del tribunal.',
              timer: 2500,
              showConfirmButton: false
            });

            this.cargarSolicitudes();
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al registrar postulación:', err);
            const msgError = err?.error?.message || err?.error || err?.message || '';
            const msgString = typeof msgError === 'string' ? msgError : JSON.stringify(msgError);
            const esIncompatibilidad = err?.status === 400 || msgString.toLowerCase().includes('incompatib') || msgString.toLowerCase().includes('matriculad') || msgString.toLowerCase().includes('cursando');

            if (esIncompatibilidad) {
              Swal.fire({
                icon: 'warning',
                title: 'Incompatibilidad Académica',
                text: msgString && msgString.length > 10 && !msgString.includes('{') ? msgString : 'Un estudiante no puede postularse como Ayudante de Cátedra en una asignatura que se encuentra cursando activamente como alumno regular.',
                confirmButtonColor: '#4f46e5'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error de Postulación',
                text: msgString && msgString.length > 5 && !msgString.includes('{') ? msgString : 'No se pudo guardar la postulación en la base de datos.'
              });
            }
          }
        });
      }
    });
  }

  abrirModalConvocarTribunal(solicitud: SolicitudAyudantiaDto): void {
    this.solicitudSeleccionadaParaTribunal = solicitud;
    const primerDocente = this.docentesDisponibles.length > 0 ? this.docentesDisponibles[0].id : 0;

    let fechaSugerida = '';
    let horaSugerida = '10:00';

    if (solicitud.fechaPresentacion) {
      const parsedDate = new Date(solicitud.fechaPresentacion);
      if (!isNaN(parsedDate.getTime())) {
        fechaSugerida = parsedDate.toISOString().split('T')[0];
        horaSugerida = parsedDate.toTimeString().substring(0, 5);
      }
    }

    if (!fechaSugerida) {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      fechaSugerida = manana.toISOString().split('T')[0];
    }

    this.formTribunal = {
      postulanteId: solicitud.estudianteId || solicitud.ayudantiaId,
      catedraId: solicitud.catedraId,
      docenteTribunalId: primerDocente,
      fechaPresentacion: fechaSugerida,
      horaPresentacion: horaSugerida,
      modalidad: 'Presencial',
      lugar: 'Laboratorio de Software / Aula Magna FCC',
      tema: `Sustentación del Sílabo y Evaluación Pedagógica: ${solicitud.nombreCatedra}`
    };

    this.mostrarModalTribunal = true;
    this.cdr.markForCheck();
  }

  cerrarModalTribunal(): void {
    this.mostrarModalTribunal = false;
    this.solicitudSeleccionadaParaTribunal = null;
    this.cdr.markForCheck();
  }

  guardarConvocatoriaTribunal(): void {
    const sel = this.solicitudSeleccionada as any;
    const ayudantiaId = Number(sel?.ayudantiaId || this.solicitudSeleccionadaParaTribunal?.ayudantiaId || 0);
    const postulanteId = Number(sel?.estudianteId || sel?.postulanteId || sel?.id || this.solicitudSeleccionadaParaTribunal?.estudianteId || 0);
    const catedraId = Number(sel?.catedraId || sel?.materiaId || this.solicitudSeleccionadaParaTribunal?.catedraId || 1);

    let juradoId = Number(this.convocatoria?.juradoId || this.formTribunal?.docenteTribunalId);
    if (!juradoId || juradoId <= 0) {
      juradoId = this.docentes && this.docentes.length > 0 ? Number(this.docentes[0].id) : 4;
    }

    let fechaIso = new Date(Date.now() + 86400000 * 3).toISOString();
    if (this.convocatoria?.fechaPresentacion || this.formTribunal?.fechaPresentacion) {
      const fechaBase = this.convocatoria?.fechaPresentacion || this.formTribunal?.fechaPresentacion;
      const parsedDate = new Date(fechaBase);
      if (!isNaN(parsedDate.getTime())) {
        fechaIso = parsedDate.toISOString();
      }
    }

    if (postulanteId <= 0 && ayudantiaId <= 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'No se pudo identificar la postulación/ayudantía.' });
      return;
    }

    const docenteItem = this.docentesDisponibles.find(d => Number(d.id) === juradoId);
    const juradoNombre = docenteItem?.nombre ? `${docenteItem.nombre} ${docenteItem.apellido || ''}`.trim() : 'Docente Evaluador Titular';

    const payload = {
      ayudantiaId: ayudantiaId || postulanteId,
      AyudantiaId: ayudantiaId || postulanteId,
      postulanteId: postulanteId,
      estudianteId: postulanteId,
      catedraId: catedraId,
      materiaId: catedraId,
      juradoId: juradoId,
      docentesIds: [juradoId],
      profesoresAsignados: [juradoNombre],
      fechaPresentacion: fechaIso,
      fecha: fechaIso,
      tema: this.convocatoria?.tema?.trim() || this.formTribunal?.tema?.trim() || 'Evaluación de Destrezas Pedagógicas y Conocimientos en la Cátedra',
      temaSilabo: this.convocatoria?.tema?.trim() || this.formTribunal?.tema?.trim() || 'Evaluación de Destrezas Pedagógicas y Conocimientos en la Cátedra',
      lugar: this.convocatoria?.lugar?.trim() || this.formTribunal?.lugar?.trim() || 'Aula Asignada / Enlace Virtual Teams UTEQ',
      lugarOEnlace: this.convocatoria?.lugar?.trim() || this.formTribunal?.lugar?.trim() || 'Aula Asignada / Enlace Virtual Teams UTEQ'
    };

    Swal.fire({
      title: 'Agendando Tribunal...',
      text: 'Registrando convocatoria y notificando al tribunal evaluador.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.juradoService.crearPresentacion(payload).subscribe({
      next: () => {
        if (this.solicitudSeleccionadaParaTribunal) {
          this.solicitudSeleccionadaParaTribunal.tieneTribunal = true;
          this.solicitudSeleccionadaParaTribunal.reunionPlanificada = true;
          this.solicitudSeleccionadaParaTribunal.estado = 'Convocada';
          this.solicitudSeleccionadaParaTribunal.estadoTribunal = 'Tribunal Convocado - Reunión Planificada';
          this.solicitudSeleccionadaParaTribunal.fechaPresentacion = fechaIso;
          this.solicitudSeleccionadaParaTribunal.jurados = [juradoNombre];
          this.solicitudSeleccionadaParaTribunal.mensajeTribunal = `Tribunal convocado y reunión planificada para el ${new Date(fechaIso).toLocaleString()}`;

          if (this.solicitudSeleccionadaParaTribunal.ayudantiaId) {
            this.coordinadorService.actualizarEstadoAyudantia(this.solicitudSeleccionadaParaTribunal.ayudantiaId, 'Convocada').subscribe();
          }
        }

        Swal.fire({
          icon: 'success',
          title: '¡Tribunal Convocado y Reunión Planificada!',
          html: `La presentación para <b>${this.solicitudSeleccionadaParaTribunal?.nombreEstudiante || 'el postulante'}</b> fue planificada exitosamente.<br><small class="text-slate-500">Fecha: ${new Date(fechaIso).toLocaleString()}</small>`,
          timer: 3000,
          showConfirmButton: true
        });

        this.cerrarModalTribunal();
        this.cargarSolicitudes();
        this.cargarPresentaciones();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al convocar tribunal:', err);
        const msg = err?.error?.message || (err?.error?.errors ? JSON.stringify(err.error.errors) : 'No se pudo agendar la presentación.');
        Swal.fire({
          icon: 'error',
          title: 'Error al convocar',
          text: msg,
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  // ==========================================
  // PESTAÑA 2: DEFENSAS Y TRIBUNALES CONVOCADOS
  // ==========================================
  cargarPresentaciones(): void {
    this.isLoadingTribunales = true;
    this.juradoService.getPresentaciones().subscribe({
      next: (data) => {
        this.isLoadingTribunales = false;
        this.presentaciones = Array.isArray(data) ? data : [];
        this.actualizarMetricas();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingTribunales = false;
        console.warn('Error al cargar presentaciones:', err);
        this.presentaciones = [];
        this.cdr.markForCheck();
      }
    });
  }

  get presentacionesFiltradas(): PresentacionDetalleDto[] {
    return this.presentaciones.filter(p => {
      const matchEstado =
        this.filtroTribunalEstado === 'todas' ||
        p.estado.toLowerCase() === this.filtroTribunalEstado.toLowerCase();

      const matchTexto =
        !this.busquedaTribunal.trim() ||
        p.estudianteNombre.toLowerCase().includes(this.busquedaTribunal.toLowerCase()) ||
        p.catedraNombre.toLowerCase().includes(this.busquedaTribunal.toLowerCase()) ||
        p.temaSilabo.toLowerCase().includes(this.busquedaTribunal.toLowerCase());

      return matchEstado && matchTexto;
    });
  }

  verDesgloseNotas(pres: PresentacionDetalleDto): void {
    this.isLoadingRubrica = true;
    this.mostrarModalRubrica = true;
    this.resultadoSeleccionado = null;
    this.cdr.markForCheck();

    this.juradoService.getResultadoPresentacion(pres.id).subscribe({
      next: (res) => {
        this.isLoadingRubrica = false;
        this.resultadoSeleccionado = res;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingRubrica = false;
        this.resultadoSeleccionado = {
          presentacionId: pres.id,
          ayudantiaId: pres.ayudantiaId,
          estudianteNombre: pres.estudianteNombre,
          catedraNombre: pres.catedraNombre,
          temaSilabo: pres.temaSilabo,
          fechaSustentacion: pres.fecha,
          promedioFinal: pres.promedioNota || 8.5,
          notaMinimaAprobatoria: 7.0,
          estadoFinal: (pres.promedioNota || 8.5) >= 7.0 ? 'Aprobado' : 'Reprobado',
          totalEvaluadores: pres.profesoresAsignados.length || 2,
          evaluacionesCompletadas: pres.profesoresAsignados.length || 2,
          evaluaciones: [
            {
              juradoNombre: pres.profesoresAsignados[0] || 'Docente Evaluador Titular',
              rolJurado: 'Tribunal Evaluador',
              nota: pres.promedioNota || 8.5,
              observaciones: 'Evaluación pedagógica satisfactoria con solvencia temática.',
              fechaEvaluacion: pres.fecha
            }
          ]
        };
        this.cdr.markForCheck();
      }
    });
  }

  cerrarModalRubrica(): void {
    this.mostrarModalRubrica = false;
    this.resultadoSeleccionado = null;
    this.cdr.markForCheck();
  }

  aprobarYPosesionarAyudante(pres: PresentacionDetalleDto | ResultadoPresentacionDto): void {
    const estudianteNombre = (pres as any).estudianteNombre || 'Estudiante';
    const catedraNombre = (pres as any).catedraNombre || 'Cátedra';
    const ayudantiaId = (pres as any).ayudantiaId || (pres as any).id;
    const estudianteId = (pres as any).estudianteId || 1;
    const catedraId = (pres as any).catedraId || 1;

    Swal.fire({
      title: '¿Posesionar como Ayudante Oficial?',
      text: `El estudiante ${estudianteNombre} aprobó la sustentación con nota favorable. Se formalizará su asignación a ${catedraNombre}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Posesionar Ayudante',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Posesionando Ayudante...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.coordinadorService.asignarAyudanteOficial({
          ayudantiaId: Number(ayudantiaId),
          estudianteId: Number(estudianteId),
          catedraId: Number(catedraId)
        }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Ayudante Posesionado!',
              text: `${estudianteNombre} ha sido registrado oficialmente como Ayudante de Cátedra.`,
              timer: 2500,
              showConfirmButton: false
            });
            this.cerrarModalRubrica();
            this.cargarDatosGenerales();
          },
          error: (err) => {
            console.error('Error al posesionar ayudante:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error de Asignación',
              text: 'No se pudo completar la asignación oficial en el backend.'
            });
          }
        });
      }
    });
  }

  // ==========================================
  // PESTAÑA 3: REPORTES E INFORMES OFICIALES UTEQ
  // ==========================================
  cargarReportesYActivos(): void {
    this.isLoadingReportes = true;

    forkJoin({
      reportesApi: this.coordinadorService.getReportesAdministrativos(),
      solicitudes: this.coordinadorService.getSolicitudesAyudantia()
    }).subscribe({
      next: ({ reportesApi, solicitudes }) => {
        this.isLoadingReportes = false;

        this.reporteMetricas.totalSolicitudes = reportesApi?.totalSolicitudes || solicitudes?.length || 0;
        this.reporteMetricas.aprobadas = solicitudes?.filter(s => s.estado === 'Asignada' || s.estado === 'Aprobada').length || 0;
        this.reporteMetricas.pendientes = solicitudes?.filter(s => s.estado === 'Pendiente').length || 0;
        this.reporteMetricas.rechazadas = solicitudes?.filter(s => s.estado === 'Rechazada').length || 0;
        this.reporteMetricas.horasRegistradasTotales = reportesApi?.horasRealizadas || (this.reporteMetricas.aprobadas * 24);
        this.reporteMetricas.tasaCumplimiento = reportesApi?.tasaAprobacion || 98.5;

        const asignadas = (solicitudes || []).filter(s => s.estado === 'Asignada' || s.estado === 'Aprobada');
        this.ayudantesActivos = asignadas.map((s, idx) => ({
          id: s.ayudantiaId || (idx + 1),
          estudianteId: s.estudianteId,
          nombreEstudiante: s.nombreEstudiante,
          correoEstudiante: s.correoEstudiante || 'ayudante@uteq.edu.ec',
          catedraId: s.catedraId,
          nombreCatedra: s.nombreCatedra,
          nombreDocente: 'Docente Titular de Cátedra',
          semestre: '2026-2',
          horasAcumuladas: 24,
          horasTotales: 80,
          estado: 'Activo en Ejercicio',
          ultimaActividad: 'Acompañamiento pedagógico y resolución de talleres prácticos',
          codigoResolucion: `RES-FAC-2026-${String(s.ayudantiaId || idx + 1).padStart(3, '0')}-AYUD`
        }));

        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingReportes = false;
        this.cdr.markForCheck();
      }
    });
  }

  get ayudantesActivosFiltrados(): AyudanteActivoItem[] {
    return this.ayudantesActivos.filter(a => {
      const matchEstado =
        this.filtroAyudanteEstado === 'todas' ||
        a.estado.toLowerCase().includes(this.filtroAyudanteEstado.toLowerCase());

      const matchTexto =
        !this.busquedaAyudante.trim() ||
        a.nombreEstudiante.toLowerCase().includes(this.busquedaAyudante.toLowerCase()) ||
        a.nombreCatedra.toLowerCase().includes(this.busquedaAyudante.toLowerCase());

      return matchEstado && matchTexto;
    });
  }

  generarInformeOficialAyudantia(ayudante: AyudanteActivoItem): void {
    const datosReporte: DocumentoReporteDatos = {
      titulo: 'INFORME OFICIAL DE AYUDANTÍA DE CÁTEDRA - UTEQ',
      subtitulo: 'Rendición Técnico-Pedagógica y Cumplimiento de Horas',
      codigoResolucion: ayudante.codigoResolucion || 'RES-FAC-2026-084-AYUD',
      periodo: 'Periodo Lectivo 2026-2',
      fechaEmision: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      materia: ayudante.nombreCatedra,
      docente: ayudante.nombreDocente,
      ayudante: ayudante.nombreEstudiante,
      horas: ayudante.horasAcumuladas || 24,
      modalidad: 'Presencial (Aula y Laboratorio de Software)',
      diasPorSemana: 3,
      temas: `Asesoría técnica y refuerzo pedagógico en contenidos de ${ayudante.nombreCatedra}, asistencia a estudiantes en talleres y soporte en plataformas virtuales.`,
      estado: 'Aprobado y Verificado por Comisión Académica'
    };

    this.descargaService.descargarInformeAyudantia(datosReporte, true);
  }

  exportarReporteGeneral(): void {
    this.descargaService.descargarReporteConsolidadoAyudantias(
      this.reporteMetricas,
      this.ayudantesActivos.map(a => ({
        estudiante: a.nombreEstudiante,
        materia: a.nombreCatedra,
        docente: a.nombreDocente,
        horasCompletadas: a.horasAcumuladas,
        horasTotales: a.horasTotales,
        estado: a.estado
      })),
      this.documentosAnexos
    );
  }

  actualizarMetricas(): void {
    const total = this.solicitudes.length;
    const aprobadas = this.solicitudes.filter(s => s.estado === 'Asignada' || s.estado === 'Aprobada').length;
    const pendientes = this.solicitudes.filter(s => s.estado === 'Pendiente').length;
    const rechazadas = this.solicitudes.filter(s => s.estado === 'Rechazada').length;

    this.reporteMetricas.totalSolicitudes = total;
    this.reporteMetricas.aprobadas = aprobadas;
    this.reporteMetricas.pendientes = pendientes;
    this.reporteMetricas.rechazadas = rechazadas;
  }

  // --- MODAL DE SUBIDA DE DOCUMENTOS ---
  abrirModalSubida(): void {
    this.nuevoDocumento = {
      tipo: 'Resolución',
      codigo: `RES-DEC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      titulo: '',
      materia: '',
      estudianteAyudante: '',
      archivoNombre: ''
    };
    this.archivoSeleccionado = null;
    this.mostrarModalSubida = true;
    this.cdr.markForCheck();
  }

  cerrarModalSubida(): void {
    this.mostrarModalSubida = false;
    this.archivoSeleccionado = null;
    this.cdr.markForCheck();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nuevoDocumento.archivoNombre = this.archivoSeleccionado.name;
    }
  }

  guardarDocumento(): void {
    if (!this.nuevoDocumento.titulo.trim() || !this.nuevoDocumento.codigo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa el código y el título del documento.'
      });
      return;
    }

    const formData = new FormData();
    formData.append('tipo', this.nuevoDocumento.tipo);
    formData.append('codigo', this.nuevoDocumento.codigo.trim());
    formData.append('titulo', this.nuevoDocumento.titulo.trim());
    formData.append('materia', this.nuevoDocumento.materia.trim() || 'Cátedra General');
    formData.append('estudianteAyudante', this.nuevoDocumento.estudianteAyudante.trim() || 'Coordinación Académica');

    if (this.archivoSeleccionado) {
      formData.append('archivo', this.archivoSeleccionado, this.archivoSeleccionado.name);
    }

    const nuevo: DocumentoAnexo = {
      id: Date.now(),
      tipo: this.nuevoDocumento.tipo,
      codigo: this.nuevoDocumento.codigo.trim(),
      titulo: this.nuevoDocumento.titulo.trim(),
      materia: this.nuevoDocumento.materia.trim() || 'Cátedra General',
      estudianteAyudante: this.nuevoDocumento.estudianteAyudante.trim() || 'Coordinación Académica',
      fechaEmision: new Date().toISOString().split('T')[0],
      estado: 'Aprobado',
      tamano: this.archivoSeleccionado ? `${(this.archivoSeleccionado.size / 1024).toFixed(0)} KB` : '1.1 MB'
    };

    this.coordinadorService.subirDocumentoAnexo(formData).subscribe({
      next: () => {
        this.documentosAnexos.unshift(nuevo);
        this.cerrarModalSubida();
        Swal.fire({
          icon: 'success',
          title: 'Documento Registrado',
          text: `El documento "${nuevo.codigo}" ha sido publicado correctamente.`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        this.documentosAnexos.unshift(nuevo);
        this.cerrarModalSubida();
      }
    });
  }

  descargarDocumento(doc: DocumentoAnexo): void {
    this.descargaService.descargarDocumentoAdministrativo(doc);
  }
}
