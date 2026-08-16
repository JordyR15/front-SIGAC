import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';

// Estudiante / Ayudante / Docente (Rutas compartidas y unificadas)
import { MateriasComponent } from './components/estudiante/materias/materias';
import { MateriaDetalleComponent } from './components/estudiante/materia-detalle/materia-detalle';
import { MiPerfilComponent } from './components/estudiante/mi-perfil/mi-perfil';
import { HorariosComponent } from './components/estudiante/horarios/horarios';
import { AyudanteMateriasComponent } from './components/ayudante/materias/materias';
import { GestionClasesComponent } from './components/docente/gestion-clases/gestion-clases';
import { GestionAyudantiaComponent } from './components/ayudante/gestion-ayudantia/gestion-ayudantia';

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

      // ESTUDIANTE / AYUDANTE / DOCENTE
      { path: 'estudiante/materias', component: MateriasComponent },
      { path: 'estudiante/materia/:id', component: MateriaDetalleComponent },
      { path: 'estudiante/horarios', component: HorariosComponent },
      { path: 'estudiante/mi-perfil', component: MiPerfilComponent },

      // AYUDANTE / DOCENTE (Rutas específicas para gestión)
      { path: 'ayudante/materias', component: AyudanteMateriasComponent },
      { path: 'ayudante/materia/:id', component: MateriaDetalleComponent },
      { path: 'ayudante/horarios', component: HorariosComponent }, // Misma ruta, mismo componente unificado
      { path: 'ayudante/mi-perfil', component: MiPerfilComponent },
      { path: 'docente/gestion-clases', component: GestionClasesComponent },
      { path: 'ayudante/gestion-ayudantia', component: GestionAyudantiaComponent },

      // ADMINISTRADOR
      { path: 'admin/solicitudes', component: SolicitudesComponent },
      { path: 'admin/asignaciones', component: AsignacionesComponent },
      { path: 'admin/seguimiento', component: SeguimientoComponent },
    ]
  }
];
