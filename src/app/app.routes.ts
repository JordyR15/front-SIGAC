import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';

// Docente
import { AlertasComponent } from './components/docente/alertas/alertas';
import { CronogramaComponent } from './components/docente/cronograma/cronograma';
import { MonitoreoComponent } from './components/docente/monitoreo/monitoreo';
import { ExpedienteComponent } from './components/docente/expediente/expediente';
import { IndicadoresComponent } from './components/docente/indicadores/indicadores';
import { EvaluacionDiagnosticaComponent } from './components/docente/evaluacion-diagnostica/evaluacion-diagnostica';

// Estudiante
import { MiPerfilComponent } from './components/estudiante/mi-perfil/mi-perfil';
import { PostulacionComponent } from './components/estudiante/postulacion/postulacion';
import { BitacoraComponent } from './components/estudiante/bitacora/bitacora';
import { InformesComponent } from './components/estudiante/informes/informes';

//administrador
import { SolicitudesComponent } from './components/administrador/solicitudes/solicitudes';
import { AsignacionesComponent } from './components/administrador/asignaciones/asignaciones';
import { SeguimientoComponent } from './components/administrador/seguimiento/seguimiento';
import { ReportesComponent } from './components/administrador/reportes/reportes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Docente
      { path: 'docente/alertas', component: AlertasComponent },
      { path: 'docente/cronograma', component: CronogramaComponent },
      { path: 'docente/monitoreo', component: MonitoreoComponent },
      { path: 'docente/expediente', component: ExpedienteComponent },
      { path: 'docente/indicadores', component: IndicadoresComponent },
      { path: 'docente/evaluacion-diagnostica', component: EvaluacionDiagnosticaComponent },

      // Estudiante
      { path: 'estudiante/mi-perfil', component: MiPerfilComponent },
      { path: 'estudiante/postulacion', component: PostulacionComponent },
      { path: 'estudiante/bitacora', component: BitacoraComponent },
      { path: 'estudiante/informes', component: InformesComponent },

      //admin
      { path: 'admin/solicitudes', component: SolicitudesComponent },
      { path: 'admin/asignaciones', component: AsignacionesComponent },
      { path: 'admin/seguimiento', component: SeguimientoComponent },
      { path: 'admin/reportes', component: ReportesComponent }
    ]
  }
];
