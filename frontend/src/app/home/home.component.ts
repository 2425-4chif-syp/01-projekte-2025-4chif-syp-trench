
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgClass } from '@angular/common';

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

  navigateToCoilManagement() {
    this.router.navigate(['/coil-management']);
  }

  navigateToCoilTypeManagement() {
    this.router.navigate(['/coiltype-management']);
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