import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoilManagementComponent } from './coil-management/coil-management/coil-management.component';
import { MeasurementManagementComponent } from './measurement-management/measurement-management.component';
import { CoilListComponent } from './coil-management/coil-list/coil-list.component';
import { CoilParentComponent } from './coil-management/coil-parent/coil-parent.component';
import { CoiltypeParentComponent } from './coiltype-management/coiltype-parent/coiltype-parent.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'coil-management', component: CoilParentComponent},
    {path: 'coiltype-management', component: CoiltypeParentComponent},
    {path: 'measurement-management', component: MeasurementManagementComponent}
];
