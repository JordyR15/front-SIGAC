import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';

// Importa los nuevos componentes del Docente
import { AlertasComponent } from './components/docente/alertas/alertas';
import { CronogramaComponent } from './components/docente/cronograma/cronograma';
import { MonitoreoComponent } from './components/docente/monitoreo/monitoreo';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // RUTAS DEL DOCENTE
      { path: 'docente/alertas', component: AlertasComponent },
      { path: 'docente/cronograma', component: CronogramaComponent },
      { path: 'docente/monitoreo', component: MonitoreoComponent },
    ]
  }
];
