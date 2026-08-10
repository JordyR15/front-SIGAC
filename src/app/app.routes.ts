import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout'; // <-- Importa desde layout (sin .component)

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent, // <-- Usa LayoutComponent
    children: [
      // ... tus rutas hijas
    ]
  }
];
