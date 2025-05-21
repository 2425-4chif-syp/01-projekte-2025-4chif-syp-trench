import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent {
  isLoginPage = false;

    constructor(public authService: AuthService, private router: Router) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.isLoginPage = event.url.split('?')[0] === '/login';
        }
      });
    }

  navigateToCoilTypeManagement() {
    this.router.navigate(['/coiltype-management']);
  }

  navigateToCoilManagement() {
    this.router.navigate(['/coil-management']);
  }

  navigateToProbeTypeManagement() {
    this.router.navigate(['/probe-type-management']);
  }

  navigateToProbeManagement() {
    this.router.navigate(['/probe-management']);
  }

  navigateToMeasurementSettings(){
    this.router.navigate(['/measurement-settings-list']);
  }

  navigateToMeasurementManagement() {
    this.router.navigate(['/measurement-management']);
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}