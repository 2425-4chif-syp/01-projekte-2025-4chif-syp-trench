import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './auth/login/login.component';
import { CoilParentComponent } from './configuration/coil/components/coil-parent.component';
import { CoiltypeParentComponent } from './configuration/coiltype/components/coiltype-parent.component';
import { MeasurementSettingsComponent } from './configuration/measurement-settings/components/management/measurement-settings.component';
import { DisplacementVisualizationComponent } from './visualization/displacement/components/displacement-visualization.component';
import { StartMeasurementComponent } from './configuration/start-measurement/start-measurement.component';
import { MeasurementSettingsParentComponent } from "./configuration/measurement-settings/components/measurement-settings-parent.component";
import { MeasurementManagementComponent } from './configuration/measurement-management/components/measurement-management.component';
import { MeasurementHistoryComponent } from './configuration/measurement-history/components/measurement-history.component';
import { MeasurementManagementParentComponent } from './configuration/measurement-management/measurement-management-parent.component';
import { DisplacementVisualizationTestComponent } from './visualization/displacement/test/displacement-visualization-test/displacement-visualization-test.component';
import { ProbeTypeParentComponent } from './configuration/probe-type/components/probe-type-parent.component';
import { ProbeParentComponent } from './configuration/probe/components/probe-parent.component';
import { MessungParentComponent } from './configuration/messung/messung-parent.component';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    {path: 'coil-management', component: CoilParentComponent, canActivate: [AuthGuard]},
    {path: 'coiltype-management', component: CoiltypeParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-settings', component: MeasurementSettingsComponent, canActivate: [AuthGuard]},
    {path: 'displacement-visualization', component: DisplacementVisualizationComponent, canActivate: [AuthGuard]},
    {path: 'probe-type-management', component: ProbeTypeParentComponent, canActivate: [AuthGuard]},
    {path: 'probe-management', component: ProbeParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-management', component: MessungParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-settings-list', component: MeasurementSettingsParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-history', component: MeasurementHistoryComponent, canActivate: [AuthGuard]},
    {path: 'measurement-history-homescreen', component: MeasurementManagementParentComponent, canActivate: [AuthGuard]},
    {path: 'displacement-visualization-test', component: DisplacementVisualizationTestComponent, canActivate: [AuthGuard]}
];
