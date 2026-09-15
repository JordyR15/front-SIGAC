import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminDocenteService, DocenteItemDto } from '../../../services/admin-docente.service';
import { AuthService } from '../../../services/auth.service';
import { RolesService, RolSistema } from '../../../services/roles.service';

@Component({
  selector: 'app-admin-docentes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-docentes.html',
  styleUrls: ['./admin-docentes.css']
})
export class AdminDocentesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminDocenteService = inject(AdminDocenteService);
  private authService = inject(AuthService);
  private rolesService = inject(RolesService);

  docentes: DocenteItemDto[] = [];
  docenteForm!: FormGroup;

  modalAbierto = false;
  isSubmitting = false;
  filtroTexto = '';
  filtroRol = 'Todos';

  mensajeExito = '';
  mensajeError = '';
  esAdministrador = false;
  esDecano = false;
  esCoordinador = false;

  modalRolesAbierto = false;
  docenteEditando: DocenteItemDto | null = null;
  rolesEnEdicion: string[] = [];
  isUpdatingRoles = false;

  // Roles disponibles para asignación múltiple
  rolesDisponibles = [
    { key: 'Docente', label: 'Docente de Cátedra', descripcion: 'Imparte materias, crea tareas y evalúa estudiantes', obligatorio: true },
    { key: 'Coordinador', label: 'Coordinador de Carrera', descripcion: 'Valida ayudantías, define notas mínimas y convoca tribunales', obligatorio: false },
    { key: 'Tribunal', label: 'Miembro de Tribunal Evaluador', descripcion: 'Califica sustentaciones de ayudantes y emite dictámenes técnicos', obligatorio: false }
  ];

  ngOnInit(): void {
    this.detectarPermisosGestion();
    this.iniciarFormulario();
    this.cargarDocentes();
  }

  private normalizarRol(rol: string): string {
    return (rol || '').trim().toLowerCase();
  }

  private canonizarRol(rol: string): RolSistema | null {
    const r = this.normalizarRol(rol);
    if (r === 'administrador' || r === 'admin') return 'Administrador';
    if (r === 'decano') return 'Decano';
    if (r === 'coordinador') return 'Coordinador';
    if (r === 'docente') return 'Docente';
    if (r === 'estudiante') return 'Estudiante';
    return null;
  }

  private detectarPermisosGestion(): void {
    this.esAdministrador = this.authService.hasRole('Administrador');
    this.esDecano = this.authService.hasRole('Decano');
    this.esCoordinador = this.authService.hasRole('Coordinador');
  }

  get puedeGestionarRoles(): boolean {
    return this.esAdministrador || this.esDecano || this.esCoordinador;
  }

  get tituloGestion(): string {
    if (this.esAdministrador) return 'Gestión y Registro de Docentes';
    return 'Gestión de Roles Académicos';
  }

  get subtituloGestion(): string {
    if (this.esAdministrador) {
      return 'Asignación de responsabilidades académicas múltiples (Docente de Cátedra, Coordinador de Carrera y Tribunal Evaluador).';
    }
    return 'Actualiza roles de usuarios usando el endpoint institucional de roles según tu nivel de autorización.';
  }

  get rolesPermitidosParaGestion(): RolSistema[] {
    if (this.esAdministrador) return ['Administrador', 'Decano', 'Coordinador', 'Docente', 'Estudiante'];
    if (this.esDecano) return ['Coordinador', 'Docente', 'Estudiante'];
    if (this.esCoordinador) return ['Docente', 'Estudiante'];
    return [];
  }

  puedeEditarUsuario(docente: DocenteItemDto): boolean {
    if (!this.puedeGestionarRoles) return false;
    if (!docente.roles || docente.roles.length === 0) return true;
    return docente.roles.every((r) => {
      const canon = this.canonizarRol(r);
      if (!canon) return false;
      return this.rolesPermitidosParaGestion.includes(canon);
    });
  }

  abrirModalRoles(docente: DocenteItemDto): void {
    if (!this.puedeEditarUsuario(docente)) return;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.docenteEditando = docente;
    const canonicos = (docente.roles || [])
      .map((r) => this.canonizarRol(r))
      .filter((r): r is RolSistema => !!r)
      .filter((r) => this.rolesPermitidosParaGestion.includes(r));
    this.rolesEnEdicion = canonicos.length > 0 ? [...canonicos] : ['Docente'];
    this.modalRolesAbierto = true;
  }

  cerrarModalRoles(): void {
    this.modalRolesAbierto = false;
    this.docenteEditando = null;
    this.rolesEnEdicion = [];
    this.isUpdatingRoles = false;
  }

  toggleRolEnEdicion(rol: RolSistema, checked: boolean): void {
    if (checked) {
      if (!this.rolesEnEdicion.includes(rol)) this.rolesEnEdicion.push(rol);
    } else {
      this.rolesEnEdicion = this.rolesEnEdicion.filter((r) => r !== rol);
    }
  }

  guardarRolesUsuario(): void {
    if (!this.docenteEditando) return;
    const rolesFinales = [...new Set(this.rolesEnEdicion)].filter((r) => this.rolesPermitidosParaGestion.includes(r as RolSistema));
    if (rolesFinales.length === 0) {
      this.mensajeError = 'Debes seleccionar al menos un rol permitido.';
      return;
    }

    this.isUpdatingRoles = true;
    this.rolesService.actualizarRoles(this.docenteEditando.id, rolesFinales).subscribe({
      next: (msg) => {
        const idx = this.docentes.findIndex((d) => d.id === this.docenteEditando!.id);
        if (idx >= 0) {
          this.docentes[idx] = { ...this.docentes[idx], roles: rolesFinales };
        }
        this.isUpdatingRoles = false;
        this.mensajeExito = msg || 'Roles actualizados correctamente.';
        Swal.fire({
          icon: 'success',
          title: 'Roles actualizados',
          text: this.mensajeExito,
          confirmButtonText: 'Aceptar'
        });
        this.cerrarModalRoles();
      },
      error: (err) => {
        this.isUpdatingRoles = false;
        const serverMsg = err?.error?.message || err?.error?.title || err?.message || 'No fue posible actualizar roles.';
        this.mensajeError = serverMsg;
        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar roles',
          text: this.mensajeError,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  iniciarFormulario(): void {
    this.docenteForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern('^[a-zA-Z0-9._-]+$')]],
      password: ['Temporal2026*', [Validators.required, Validators.minLength(6)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      // Checkboxes de roles
      rolDocente: [{ value: true, disabled: false }],
      rolCoordinador: [false],
      rolTribunal: [false],
      rolJurado: [false]
    });
  }

  cargarDocentes(): void {
    const rolParam = (!this.filtroRol || this.filtroRol === 'Todos') ? undefined : this.filtroRol;
    this.adminDocenteService.getUsuariosPorRol(rolParam).subscribe({
      next: (data) => {
        this.docentes = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error cargando usuarios',
          html: `<pre style="white-space: pre-wrap; text-align:left;">${(err && err.message) ? err.message : JSON.stringify(err)}</pre>`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  abrirModal(): void {
    if (!this.esAdministrador) return;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.docenteForm.reset({
      username: '',
      password: 'Temporal2026*',
      nombre: '',
      apellido: '',
      correo: '',
      rolDocente: true,
      rolCoordinador: false,
      rolTribunal: false,
      rolJurado: false
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // Generar sugerencia de username y correo al escribir nombres
  actualizarSugerencias(): void {
    const nom = (this.docenteForm.get('nombre')?.value || '').trim().toLowerCase();
    const ape = (this.docenteForm.get('apellido')?.value || '').trim().toLowerCase();
    if (nom && ape && !this.docenteForm.get('username')?.dirty) {
      const usernameSugerido = `${nom.split(' ')[0]}.${ape.split(' ')[0]}`;
      this.docenteForm.patchValue({
        username: usernameSugerido,
        correo: `${usernameSugerido}@universidad.edu`
      });
    }
  }

  guardarDocente(): void {
    if (!this.esAdministrador) return;
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }

    const formVal = this.docenteForm.getRawValue();

    // Construcción del array de roles inclusivos
    const rolesSeleccionados: string[] = [];
    if (formVal.rolDocente) rolesSeleccionados.push('Docente');
    if (formVal.rolCoordinador) rolesSeleccionados.push('Coordinador');
    if (formVal.rolTribunal) rolesSeleccionados.push('Tribunal');
    if (formVal.rolJurado) rolesSeleccionados.push('Jurado');

    if (rolesSeleccionados.length === 0) {
      this.mensajeError = 'Debe seleccionar al menos un rol para el docente.';
      return;
    }

    const payload = {
      username: formVal.username.trim(),
      password: formVal.password,
      nombre: formVal.nombre.trim(),
      apellido: formVal.apellido.trim(),
      correo: formVal.correo.trim(),
      roles: rolesSeleccionados
    };

    // Mostrar JSON que se enviará al backend y pedir confirmación
    Swal.fire({
      title: 'JSON a enviar al backend',
      html: `<pre style="white-space: pre-wrap; text-align:left;">${JSON.stringify(payload, null, 2).replace(/</g, '&lt;')}</pre>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      width: 700
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isSubmitting = true;
      this.mensajeExito = '';
      this.mensajeError = '';

      this.adminDocenteService.crearDocente(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          const createdId = res?.id ?? (res?.docente ? res.docente.id : null);
          const successMsg = `Docente ${payload.nombre} ${payload.apellido} registrado exitosamente${createdId ? ' (ID: ' + createdId + ')' : ''} con roles: ${rolesSeleccionados.join(', ')}.`;

          // Mostrar notificación clara al usuario
          Swal.fire({ icon: 'success', title: 'Docente creado', html: `<div style="text-align:left">${successMsg}</div>`, confirmButtonText: 'Aceptar' });

          // Limpiar formulario, cerrar modal y recargar lista
          try { this.docenteForm.reset({ username: '', password: 'Temporal2026*', nombre: '', apellido: '', correo: '', rolDocente: true, rolCoordinador: false, rolTribunal: false, rolJurado: false }); } catch {}
          this.mensajeExito = successMsg;
          this.cargarDocentes();
          this.cerrarModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.mensajeError = 'Error al registrar el docente. Por favor verifique los datos.';
          Swal.fire({ icon: 'error', title: 'Error al registrar docente', html: `<pre style="white-space:pre-wrap; text-align:left">${(err && err.message) ? err.message : JSON.stringify(err)}</pre>`, confirmButtonText: 'Aceptar' });
        }
      });
    });
  }

  get docentesFiltrados(): DocenteItemDto[] {
    return this.docentes.filter(d => {
      const matchTexto = !this.filtroTexto ||
        d.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        d.apellido.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        d.correo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        d.username.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const matchRol = this.filtroRol === 'Todos' || d.roles.includes(this.filtroRol);

      return matchTexto && matchRol;
    });
  }
}
