import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private readonly apiUrl = 'http://localhost:5127/api/auth/verify';

  constructor(private router: Router) {
    const token = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = token === 'true';
  }

  async login(password: string): Promise<boolean> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(password) 
    });

    const data = await response.json();
    
    if (data.isValid) {
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
}

