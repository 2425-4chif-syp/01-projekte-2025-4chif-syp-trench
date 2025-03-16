import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoilManagementComponent } from './coil-management/coil-management/coil-management.component';
import { MeasurementManagementComponent } from './measurement-management/measurement-management.component';
import { CoilListComponent } from './coil-management/coil-list/coil-list.component';
import { CoilParentComponent } from './coil-management/coil-parent/coil-parent.component';
import { CoiltypeParentComponent } from './coiltype-management/coiltype-parent/coiltype-parent.component';
import { MeasurementSettingsComponent } from './measurement-settings/measurement-settings.component';
import { ToleranceSettingsComponent } from './tolerance-settings/tolerance-settings.component';
import { DisplacementVisualizationComponent } from "./displacement-visualization/displacement-visualization.component";
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    {path: 'coil-management', component: CoilParentComponent, canActivate: [AuthGuard]},
    {path: 'coiltype-management', component: CoiltypeParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-result', component: MeasurementManagementComponent, canActivate: [AuthGuard]},
    {path: 'measurement-settings', component: MeasurementSettingsComponent, canActivate: [AuthGuard]},
    {path: 'tolerance-settings', component: ToleranceSettingsComponent, canActivate: [AuthGuard]},
    {path: 'displacement-visualization', component: DisplacementVisualizationComponent, canActivate: [AuthGuard]}
];
