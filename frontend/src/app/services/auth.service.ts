import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly apiUrl = 'http://localhost:5127/api/auth/verify';

  constructor(private router: Router) {
    const token = localStorage.getItem('isAuthenticated');
    this.isAuthenticatedSubject.next(token === 'true'); 
  }

  async login(password: string): Promise<boolean> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(password) 
    });

    const data = await response.json();
    
    if (data.isValid) {
      localStorage.setItem('isAuthenticated', 'true');
      this.isAuthenticatedSubject.next(true);
      this.router.navigateByUrl('/home');
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    this.isAuthenticatedSubject.next(false);
    this.router.navigateByUrl('/login').then(() => {
      window.history.replaceState({}, '', '/login'); 
    });
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value; 
  }
}
