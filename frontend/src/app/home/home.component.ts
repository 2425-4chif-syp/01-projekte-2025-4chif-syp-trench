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

  navigateToCoilManagement() {
    this.router.navigate(['/coil-management']);
  }

  navigateToCoilTypeManagement() {
    this.router.navigate(['/coiltype-management']);
  }

  navigateToMeasurementResult() {
    this.router.navigate(['/measurement-result']);
  }

  navigateToMeasureMentSettings(){
    this.router.navigate(['/measurement-settings-list']);
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}