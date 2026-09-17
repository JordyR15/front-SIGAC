import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JuradoService, CrearPresentacionDto } from '../../../services/jurado.service';
import { CoordinadorService } from '../../../services/coordinador.service';

export interface PostulanteEvaluacion {
  ayudantiaId: number;
  estudianteId: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  carrera: string;
  catedraId: number;
  catedraNombre: string;
  semestreCatedra: string;
  docenteTitularNombre: string;
  acuerdoDocenteAprobado: boolean;
  docenteObservaciones?: string;
  porcentajeMallaAprobada: number;
  creditosAprobados: number;
  creditosTotales: number;
  promedioEstudiante: number;
  promedioGeneralCarrera: number;
  notaEstudianteEnCatedra: number;
  promedioHistoricoCurso: number;
  cumpleTodosRequisitos: boolean;
  estado: string;
  temaSilaboPropuesto?: string;
}

@Component({
  selector: 'app-validacion-coordinador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './validacion-coordinador.html',
  styleUrls: ['./validacion-coordinador.css']
})
export class ValidacionCoordinadorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private juradoService = inject(JuradoService);
  private coordinadorService = inject(CoordinadorService);
  private route = inject(ActivatedRoute);

  postulantes: PostulanteEvaluacion[] = [];

  decanosDisponibles = [
    { id: 10, nombre: 'Decano Facultad de Ingeniería y Ciencias Aplicadas' },
    { id: 11, nombre: 'Subdecano Académico' }
  ];

  coordinadoresDisponibles = [
    { id: 20, nombre: 'Coordinador de Carrera de Software' },
    { id: 21, nombre: 'Coordinador de Sistemas de Información' }
  ];

  docentesExpertosDisponibles = [
    'Docente Evaluador 1 (Área de Software)',
    'Docente Evaluador 2 (Área de Sistemas)',
    'Docente Evaluador 3 (Área Pedagógica)'
  ];

  postulanteSeleccionado: PostulanteEvaluacion | null = null;
  tribunalForm!: FormGroup;
  minimoNotaForm!: FormGroup;

  isSubmitting = false;
  mensajeExito = '';
  mensajeError = '';

  ngOnInit(): void {
    this.iniciarFormularios();
    this.cargarPostulantesDesdeApi();
  }

  cargarPostulantesDesdeApi(): void {
    this.coordinadorService.getSolicitudesAyudantia().subscribe({
      next: (solicitudes) => {
        if (Array.isArray(solicitudes) && solicitudes.length > 0) {
          this.postulantes = solicitudes.map(s => {
            const partes = (s.nombreEstudiante || 'Postulante').split(' ');
            const nombres = partes.slice(0, Math.ceil(partes.length / 2)).join(' ');
            const apellidos = partes.slice(Math.ceil(partes.length / 2)).join(' ') || ' ';

            return {
              ayudantiaId: s.ayudantiaId,
              estudianteId: s.estudianteId,
              nombres,
              apellidos,
              cedula: s.cedulaEstudiante || '1700000000',
              correo: s.correoEstudiante || 'postulante@uteq.edu.ec',
              carrera: 'Ingeniería de Software',
              catedraId: s.catedraId,
              catedraNombre: s.nombreCatedra,
              semestreCatedra: '2026-2',
              docenteTitularNombre: 'Docente Titular',
              acuerdoDocenteAprobado: true,
              docenteObservaciones: 'Solicitud formal de ayudantía de cátedra.',
              porcentajeMallaAprobada: s.porcentajeMalla || 60,
              creditosAprobados: 120,
              creditosTotales: 240,
              promedioEstudiante: s.promedio || 8.5,
              promedioGeneralCarrera: 8.0,
              notaEstudianteEnCatedra: s.notaCatedra || 9.0,
              promedioHistoricoCurso: 8.0,
              cumpleTodosRequisitos: (s.promedio || 8.5) >= 8.0,
              estado: s.estado || 'Pendiente Revisión',
              temaSilaboPropuesto: s.temaSilabo || 'Evaluación Pedagógica del Sílabo'
            };
          });

          this.evaluarParametroRuta();
        } else {
          this.postulantes = [];
        }
      },
      error: () => {
        this.postulantes = [];
      }
    });
  }

  evaluarParametroRuta(): void {
    this.route.paramMap.subscribe(params => {
      const solicitudId = params.get('solicitudId');
      if (solicitudId && this.postulantes.length > 0) {
        const encontrada = this.postulantes.find(p => p.ayudantiaId === Number(solicitudId) || p.estudianteId === Number(solicitudId));
        if (encontrada) {
          this.seleccionarPostulante(encontrada);
          return;
        }
      }
      if (this.postulantes.length > 0) {
        this.seleccionarPostulante(this.postulantes[0]);
      }
    });
  }

  iniciarFormularios(): void {
    this.tribunalForm = this.fb.group({
      ayudantiaId: [null, [Validators.required]],
      fecha: ['', [Validators.required]],
      decanoId: [10, [Validators.required]],
      coordinadorCarreraId: [20, [Validators.required]],
      docenteExperto1: [this.docentesExpertosDisponibles[0], [Validators.required]],
      docenteExperto2: [this.docentesExpertosDisponibles[1], [Validators.required]],
      temaSilabo: ['', [Validators.required, Validators.minLength(5)]],
      lugarOEnlace: ['Aula Magna / Plataforma Virtual', [Validators.required]]
    });

    this.minimoNotaForm = this.fb.group({
      catedraId: [201, Validators.required],
      minimoNota: [8.0, [Validators.required, Validators.min(7.0), Validators.max(10.0)]]
    });
  }

  seleccionarPostulante(postulante: PostulanteEvaluacion): void {
    this.postulanteSeleccionado = postulante;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.coordinadorService.getValidacionRequisitosEstudiante(postulante.estudianteId).subscribe({
      next: (req) => {
        if (req && this.postulanteSeleccionado) {
          this.postulanteSeleccionado.porcentajeMallaAprobada = req.porcentajeMalla;
          this.postulanteSeleccionado.promedioEstudiante = req.promedioEstudiante;
          this.postulanteSeleccionado.promedioGeneralCarrera = req.promedioCarrera;
          this.postulanteSeleccionado.promedioHistoricoCurso = req.promedioCurso;
          this.postulanteSeleccionado.cumpleTodosRequisitos = req.cumpleRequisitos && this.postulanteSeleccionado.acuerdoDocenteAprobado;
        }
      }
    });

    this.tribunalForm.patchValue({
      ayudantiaId: postulante.ayudantiaId,
      temaSilabo: postulante.temaSilaboPropuesto || '',
      fecha: this.getFechaDefault()
    });

    this.minimoNotaForm.patchValue({
      catedraId: postulante.catedraId
    });
  }

  private getFechaDefault(): string {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }

  asignarTribunal(): void {
    if (!this.postulanteSeleccionado) return;

    if (!this.postulanteSeleccionado.cumpleTodosRequisitos) {
      this.mensajeError = 'No se puede convocar el tribunal: el estudiante no cumple con todos los requisitos académicos (50% malla, promedios o acuerdo docente).';
      return;
    }

    if (this.tribunalForm.invalid) {
      this.tribunalForm.markAllAsTouched();
      this.mensajeError = 'Por favor complete todos los campos obligatorios del Tribunal.';
      return;
    }

    const formVal = this.tribunalForm.value;

    if (formVal.docenteExperto1 === formVal.docenteExperto2) {
      this.mensajeError = 'Los dos docentes expertos asignados deben ser profesionales diferentes.';
      return;
    }

    this.isSubmitting = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const dto: CrearPresentacionDto = {
      ayudantiaId: Number(formVal.ayudantiaId),
      fecha: formVal.fecha,
      profesoresAsignados: [formVal.docenteExperto1, formVal.docenteExperto2],
      decanoId: Number(formVal.decanoId),
      coordinadorCarreraId: Number(formVal.coordinadorCarreraId),
      temaSilabo: formVal.temaSilabo,
      lugarOEnlace: formVal.lugarOEnlace
    };

    this.juradoService.crearPresentacion(dto).subscribe({
      next: (resp) => {
        this.isSubmitting = false;
        const fechaStr = dto.fecha ? new Date(dto.fecha).toLocaleString() : 'Fecha programada';
        this.mensajeExito = `¡Tribunal convocado exitosamente! Se notificó al Decano, Coordinador y a los 2 Docentes expertos para la sustentación del día ${fechaStr}.`;
        if (this.postulanteSeleccionado) {
          this.postulanteSeleccionado.estado = 'Tribunal Asignado';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.mensajeError = 'Ocurrió un error al registrar la presentación en el servidor.';
      }
    });
  }

  guardarMinimoNota(): void {
    if (this.minimoNotaForm.invalid) return;

    const { catedraId, minimoNota } = this.minimoNotaForm.value;
    this.coordinadorService.actualizarMinimoNota(catedraId, minimoNota).subscribe({
      next: (res) => {
        this.mensajeExito = res.mensaje;
      }
    });
  }
}
