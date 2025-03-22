import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-measurement-probe-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-type-management.component.html',
  styleUrl: './measurement-probe-type-management.component.scss'
})
export class MeasurementProbeTypeManagementComponent {
  hoehe: number = 250;
  breite: number = 150;
  wicklungszahl: number = 10;
}
