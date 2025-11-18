import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { GlobalAlertsComponent } from './shared/global-alerts/global-alerts.component';
import { ModeService } from './services/mode.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, GlobalAlertsComponent],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'asc-visualization';
  isLoginPage = true; 

  constructor(public authService: AuthService, public modeService: ModeService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.url.split('?')[0] === '/login';
      }
    });
  }

}
