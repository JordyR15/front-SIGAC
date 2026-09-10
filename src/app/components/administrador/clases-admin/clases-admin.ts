import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { combineLatest, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getApiBase } from '../../../api';
import { MateriaDto, MateriaService } from '../../../services/materia.service';
import { ClaseDto, ClaseService } from '../../../services/clase.service';
import { AuthService } from '../../../services/auth.service';

export interface ClaseConMaterias extends ClaseDto {
  materiasList: MateriaDto[];
  totalEstudiantes: number;
}

@Component({
  selector: 'app-clases-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './clases-admin.html'
})
export class ClasesAdminComponent implements OnInit, OnDestroy {
  clasesConMaterias: ClaseConMaterias[] = [];
  materias: MateriaDto[] = [];
  filtroTexto = '';
  filtroSemestre = 'todos';
  ayudanteEmailPorClase: Record<number, string> = {};
  asignandoAyudanteId: number | null = null;
  mensajeAsignacion: Record<number, string> = {};
  private sub?: Subscription;

  constructor(
    private claseService: ClaseService,
    private materiaService: MateriaService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  ngOnInit() {
    this.claseService.refreshClases().subscribe();

    this.sub = combineLatest([
      this.claseService.clases$,
      this.materiaService.materias$
    ]).subscribe(([clases, materias]) => {
      this.materias = materias;
      this.procesarClases(clases, materias);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private procesarClases(clases: ClaseDto[], materias: MateriaDto[]) {
    this.clasesConMaterias = clases.map(c => {
      // Encontrar materias vinculadas a esta clase
      const materiasList = materias.filter(m => 
        Number(m.claseId) === Number(c.id) ||
        (m.claseNombre && m.claseNombre.trim().toLowerCase() === c.nombre.trim().toLowerCase()) ||
        Number(c.materiaId) === Number(m.id) ||
        (c.materiaIds && c.materiaIds.includes(m.id))
      );

      // Calcular estudiantes únicos
      const estudianteSet = new Set<number>(c.estudianteIds || []);
      materiasList.forEach(m => {
        m.estudiantes?.forEach(e => estudianteSet.add(e.id));
      });

      return {
        ...c,
        materiasList,
        totalEstudiantes: estudianteSet.size || (c.estudianteIds?.length ?? 0)
      };
    });
  }

  get clasesFiltradas(): ClaseConMaterias[] {
    return this.clasesConMaterias.filter(c => {
      const matchTexto = !this.filtroTexto.trim() ||
        c.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        c.materiasList.some(m => m.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) || m.codigo.toLowerCase().includes(this.filtroTexto.toLowerCase())) ||
        (c.carrera && c.carrera.toLowerCase().includes(this.filtroTexto.toLowerCase()));

      const matchSemestre = this.filtroSemestre === 'todos' || c.semestre === this.filtroSemestre;

      return matchTexto && matchSemestre;
    });
  }

  get semestresDisponibles(): string[] {
    const list = this.clasesConMaterias.map(c => c.semestre).filter((s): s is string => !!s);
    return Array.from(new Set(['2026-2', '2026-1', ...list]));
  }

  eliminarClase(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de eliminar esta clase/cohorte académica?')) {
      this.claseService.deleteClase(id).subscribe();
    }
  }

  asignarAyudante(claseId: number) {
    const email = (this.ayudanteEmailPorClase[claseId] || '').trim();
    if (!email) {
      alert('Ingresa un correo del ayudante para asignarlo a la clase.');
      return;
    }

    this.asignandoAyudanteId = claseId;

    const materiaObjetivo = this.materias.find(m => Number(m.claseId) === Number(claseId) || Number(m.id) === Number(claseId));
    const materiaId = materiaObjetivo ? materiaObjetivo.id : claseId;

    this.materiaService.asignarAyudanteMateria(materiaId, email).subscribe({
      next: (res) => {
        const registros = JSON.parse(localStorage.getItem('sigac_clase_ayudante_asignaciones') || '[]');
        registros.unshift({ claseId, materiaId, ayudanteEmail: email, timestamp: Date.now(), source: res.fallback ? 'local' : 'api' });
        localStorage.setItem('sigac_clase_ayudante_asignaciones', JSON.stringify(registros));
        this.mensajeAsignacion[claseId] = res.mensaje;
        this.ayudanteEmailPorClase[claseId] = '';
        this.asignandoAyudanteId = null;
      },
      error: () => {
        this.mensajeAsignacion[claseId] = 'No se pudo completar la asignación del ayudante.';
        this.asignandoAyudanteId = null;
      },
      complete: () => {
        this.asignandoAyudanteId = null;
      }
    });
  }
}

