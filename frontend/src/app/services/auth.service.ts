import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private readonly hashedPassword = '31e8b4136c0ab53e17620cf45bc738837eb5560297dc8b51061466ccb739dcf3'; 

  constructor(private router: Router) {
    const token = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = token === 'true';
  }

  async login(password: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    if (hashedInput === this.hashedPassword) {
      this.isAuthenticated = true;
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    this.router.navigateByUrl('/login').then(() => {
      window.history.replaceState({}, '', '/login'); 
    });
  }
  

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}
