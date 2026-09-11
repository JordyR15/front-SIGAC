import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminDocenteService, DocenteItemDto } from '../../../services/admin-docente.service';

@Component({
  selector: 'app-admin-docentes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-docentes.html',
  styleUrls: ['./admin-docentes.css']
})
export class AdminDocentesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminDocenteService = inject(AdminDocenteService);

  docentes: DocenteItemDto[] = [];
  docenteForm!: FormGroup;

  modalAbierto = false;
  isSubmitting = false;
  filtroTexto = '';
  filtroRol = 'Todos';

  mensajeExito = '';
  mensajeError = '';

  // Roles disponibles para asignación múltiple
  rolesDisponibles = [
    { key: 'Docente', label: 'Docente de Cátedra', descripcion: 'Imparte materias, crea tareas y evalúa estudiantes', obligatorio: true },
    { key: 'Coordinador', label: 'Coordinador de Carrera', descripcion: 'Valida ayudantías, define notas mínimas y convoca tribunales', obligatorio: false },
    { key: 'Tribunal', label: 'Miembro de Tribunal Evaluador', descripcion: 'Califica sustentaciones de ayudantes y emite dictámenes técnicos', obligatorio: false }
  ];

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarDocentes();
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
    this.adminDocenteService.getDocentes().subscribe({
      next: (data) => {
        this.docentes = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error cargando docentes',
          html: `<pre style="white-space: pre-wrap; text-align:left;">${(err && err.message) ? err.message : JSON.stringify(err)}</pre>`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  abrirModal(): void {
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
