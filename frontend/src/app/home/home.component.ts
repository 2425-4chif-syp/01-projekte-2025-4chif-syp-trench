
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToCoilManagement() {
    this.router.navigate(['/coil-management']);
  }

  navigateToCoilTypeManagement() {
    this.router.navigate(['/coiltype-management']);
  }

  navigateToMeasurementManagement() {
    this.router.navigate(['/measurement-management']);
  }
}