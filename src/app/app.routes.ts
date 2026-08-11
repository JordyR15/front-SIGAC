import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';

// Estudiante
import { MateriasComponent } from './components/estudiante/materias/materias';
import { MateriaDetalleComponent } from './components/estudiante/materia-detalle/materia-detalle';
import { MiPerfilComponent } from './components/estudiante/mi-perfil/mi-perfil';

// Ayudante
import { PostulacionComponent } from './components/estudiante/postulacion/postulacion';
import { BitacoraComponent } from './components/estudiante/bitacora/bitacora';
import { InformesComponent } from './components/estudiante/informes/informes';

// Administrador
import { SolicitudesComponent } from './components/administrador/solicitudes/solicitudes';
import { AsignacionesComponent } from './components/administrador/asignaciones/asignaciones';
import { SeguimientoComponent } from './components/administrador/seguimiento/seguimiento';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ESTUDIANTE
      { path: 'estudiante/materias', component: MateriasComponent },
      { path: 'estudiante/materia/:id', component: MateriaDetalleComponent },
      { path: 'estudiante/materias', component: MateriasComponent },
      { path: 'estudiante/mi-perfil', component: MiPerfilComponent },

      // AYUDANTE (Rutas que solo verán los ayudantes)
      { path: 'ayudante/postulacion', component: PostulacionComponent },
      { path: 'ayudante/bitacora', component: BitacoraComponent },
      { path: 'ayudante/informes', component: InformesComponent },

      // ADMINISTRADOR
      { path: 'admin/solicitudes', component: SolicitudesComponent },
      { path: 'admin/asignaciones', component: AsignacionesComponent },
      { path: 'admin/seguimiento', component: SeguimientoComponent },
    ]
  }
];
