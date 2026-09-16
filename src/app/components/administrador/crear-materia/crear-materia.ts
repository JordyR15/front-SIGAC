import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MateriaService } from '../../../services/materia.service';
import { AdminDocenteService } from '../../../services/admin-docente.service';
import { ClaseService, ClaseDto } from '../../../services/clase.service';

interface DocenteSelectorItem {
  id: number;
  nombre: string;
  correo?: string;
}

@Component({
  selector: 'app-crear-materia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crear-materia.html'
})
export class CrearMateriaComponent implements OnInit, OnDestroy {
  private subDocentes?: Subscription;
  private subClases?: Subscription;
  private subParams?: Subscription;

  docentes: DocenteSelectorItem[] = [];
  clases: ClaseDto[] = [];

  semestres = ['2026-2', '2026-1', '2027-1', '2025-2'];
  grupos = ['Grupo A (Diurno)', 'Grupo B (Tarde)', 'Grupo C (Nocturno)', 'Laboratorio / Práctico'];

  nuevaMateria = {
    nombre: '',
    codigo: '',
    descripcion: '',
    semestre: '2026-2',
    grupo: 'Grupo A (Diurno)',
    docenteId: 0,
    claseId: 0,
    creditos: 4
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private materiaService: MateriaService,
    private adminDocenteService: AdminDocenteService,
    private claseService: ClaseService
  ) {}

  ngOnInit() {
    this.subDocentes = this.adminDocenteService.getDocentes().subscribe({
      next: (list) => {
        const safeList = Array.isArray(list) ? list : ((list as any)?.$values || (list as any)?.data || []);
        this.docentes = safeList
          .filter(Boolean)
          .map((d: any): DocenteSelectorItem => {
            const id = Number(d?.id ?? d?.M_ID ?? d?.personaId ?? d?.docenteId ?? 0);
            const nombre = [d?.nombre ?? d?.NOMBRE, d?.apellido ?? d?.APELLIDO].filter(Boolean).join(' ').trim()
              || d?.username || d?.usuario || d?.nombreCompleto || 'Docente';
            const correo = d?.correo ?? d?.email ?? d?.CORREO ?? '';
            return {
              id,
              nombre,
              correo
            };
          })
          .filter((d: DocenteSelectorItem) => d.id > 0);

        const docenteOficial = this.docentes.find((d: DocenteSelectorItem) => (d.correo || '').toLowerCase() === 'docente@uteq.edu.ec');
        if (docenteOficial) {
          this.nuevaMateria.docenteId = docenteOficial.id;
        } else if (this.docentes.length > 0 && !this.nuevaMateria.docenteId) {
          this.nuevaMateria.docenteId = this.docentes[0].id;
        }
      },
      error: () => {
        this.docentes = [];
      }
    });

    this.subClases = this.claseService.getClases().subscribe({
      next: (list) => {
        this.clases = list || [];
      },
      error: () => {
        this.clases = [];
      }
    });

    this.subParams = this.route.queryParams.subscribe((params) => {
      if (params['claseId']) {
        this.nuevaMateria.claseId = Number(params['claseId']);
      }
      if (params['semestre']) {
        this.nuevaMateria.semestre = params['semestre'];
      }
    });
  }

  ngOnDestroy() {
    this.subDocentes?.unsubscribe();
    this.subClases?.unsubscribe();
    this.subParams?.unsubscribe();
  }

  guardarMateria() {
    if (!this.nuevaMateria.nombre.trim() || !this.nuevaMateria.codigo.trim()) {
      this.errorMessage = 'Por favor, completa el nombre y código de la materia.';
      return;
    }

    const docenteId = Number(this.nuevaMateria.docenteId);
    if (!docenteId || docenteId <= 0) {
      this.errorMessage = 'Por favor, selecciona un docente titular responsable.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      nombre: this.nuevaMateria.nombre.trim(),
      codigo: this.nuevaMateria.codigo.trim().toUpperCase(),
      descripcion: this.nuevaMateria.descripcion?.trim() || '',
      semestre: this.nuevaMateria.semestre,
      creditos: Number(this.nuevaMateria.creditos) || 4,
      docenteId: docenteId
    };

    this.materiaService.crearMateria(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = `¡Materia "${payload.nombre}" creada y registrada exitosamente!`;

        const selectedClaseId = Number(this.nuevaMateria.claseId);
        const nuevaMateriaId = Number(res?.id ?? res?.materiaId ?? res?.data?.id ?? 0);

        if (selectedClaseId > 0) {
          const claseSeleccionada = this.clases.find(c => Number(c.id) === Number(selectedClaseId));

          if (claseSeleccionada) {
            const materiaIdEnClase = Number(claseSeleccionada.materiaId || 0);

            // Caso A: La clase aún no tenía materia asignada
            if (!materiaIdEnClase) {
              const updateClasePayload = {
                nombre: claseSeleccionada.nombre,
                semestre: claseSeleccionada.semestre || payload.semestre,
                carrera: claseSeleccionada.carrera || 'Ingeniería de Software',
                descripcion: claseSeleccionada.descripcion || '',
                materiaId: nuevaMateriaId > 0 ? nuevaMateriaId : undefined,
                materiaNombre: res?.nombre || payload.nombre,
                docenteId: payload.docenteId || claseSeleccionada.docenteId
              };

              this.claseService.updateClase(selectedClaseId, updateClasePayload).subscribe({
                next: () => {
                  this.claseService.refreshClases().subscribe();
                },
                error: (err) => console.warn('Error al actualizar clase asignada:', err)
              });
            }
            // Caso B: La clase ya tenía otra materia asignada -> NO sobreescribir; crear clase duplicada para esta nueva materia
            else if (nuevaMateriaId > 0 && materiaIdEnClase !== nuevaMateriaId) {
              this.claseService.createClase({
                nombre: claseSeleccionada.nombre,
                materiaId: nuevaMateriaId,
                docenteId: payload.docenteId || claseSeleccionada.docenteId,
                semestre: payload.semestre || claseSeleccionada.semestre || '2026-2'
              }).subscribe({
                next: () => {
                  this.claseService.refreshClases().subscribe();
                },
                error: (err) => console.warn('Error al crear clase vinculada para la nueva materia:', err)
              });
            }
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Materia creada',
          text: `La materia "${payload.nombre}" ha sido registrada exitosamente${selectedClaseId > 0 ? ' y asignada al paralelo correspondiente' : ''}.`,
          timer: 1600,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/admin/materias']);
        }, 1300);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error?.title || 'Hubo un error al guardar la materia en el backend. Verifica la conexión.';
        this.errorMessage = msg;
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: msg,
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }
}
