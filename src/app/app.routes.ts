import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard'; // <-- IMPORTA EL DASHBOARD

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent }, // <-- AGREGA ESTA RUTA
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
