import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoilManagementComponent } from './coil-management/coil-management.component';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'coil-management', component: CoilManagementComponent}
];
