import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ModeService } from '../services/mode.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private modeService: ModeService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.modeService.isAdminMode()) {
      return true;
    } else {
      // Weiterleitung zur Home-Seite
      this.router.navigate(['/home']);
      return false;
    }
  }
}
