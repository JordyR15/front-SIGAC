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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'docente/alertas', component: AlertasComponent },
      { path: 'docente/cronograma', component: CronogramaComponent },
      { path: 'docente/monitoreo', component: MonitoreoComponent },
      { path: 'docente/expediente', component: ExpedienteComponent },
      { path: 'docente/indicadores', component: IndicadoresComponent },
      { path: 'docente/evaluacion-diagnostica', component: EvaluacionDiagnosticaComponent }
    ]
  }
];
