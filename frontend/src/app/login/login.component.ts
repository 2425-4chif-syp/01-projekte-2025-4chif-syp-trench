// login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class LoginComponent implements OnInit {
  password: string = '';
  error: string = '';
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.password = '';  
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  async onSubmit() {
    if (!this.password.trim()) {
      this.error = 'Passwort darf nicht leer sein';
      return;
    }
    
    const success = await this.authService.login(this.password);
    if (success) {
      this.router.navigate(['/home']);
    } else {
      this.error = 'Falsches Passwort';
    }
  }  
}
