import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { CoilParentComponent } from './configuration/coil/components/coil-parent.component';
import { CoiltypeParentComponent } from './configuration/coiltype/components/coiltype-parent.component';
import { MQTTMeasurementComponent } from './configuration/measurement/components/measurement-management.component';
import { MeasurementSettingsComponent } from './configuration/measurement-settings/components/management/measurement-settings.component';
import { ToleranceSettingsComponent } from './configuration/tolerance-settings/components/tolerance-settings.component';
import { DisplacementVisualizationComponent } from './visualization/displacement/components/displacement-visualization.component';
import { MeasurementProbeTypeParentComponent } from './configuration/measurement-probe-type/components/measurement-probe-type-parent.component';
import { StartMeasurementComponent } from './configuration/start-measurement/start-measurement.component';
import { MeasurementSettingsParentComponent } from "./configuration/measurement-settings/components/measurement-settings-parent.component";
import { MeasurementManagementComponent } from './configuration/measurement-management/components/measurement-management.component';
import { MeasurementHistoryComponent } from './configuration/measurement-history/components/measurement-history.component';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    {path: 'coil-management', component: CoilParentComponent, canActivate: [AuthGuard]},
    {path: 'coiltype-management', component: CoiltypeParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-result', component: MQTTMeasurementComponent, canActivate: [AuthGuard]},
    {path: 'measurement-settings', component: MeasurementSettingsComponent, canActivate: [AuthGuard]},
    {path: 'tolerance-settings', component: ToleranceSettingsComponent, canActivate: [AuthGuard]},
    {path: 'displacement-visualization', component: DisplacementVisualizationComponent, canActivate: [AuthGuard]},
    {path: 'measurement-probe-type-management', component: MeasurementProbeTypeParentComponent, canActivate: [AuthGuard]},
    {path: 'start-measurement', component: StartMeasurementComponent, canActivate: [AuthGuard]},
    {path: 'measurement-settings-list', component: MeasurementSettingsParentComponent, canActivate: [AuthGuard]},
    {path: 'measurement-history', component: MeasurementHistoryComponent, canActivate: [AuthGuard]},
    {path: 'measurement-management', component: MeasurementManagementComponent, canActivate: [AuthGuard]},
];
