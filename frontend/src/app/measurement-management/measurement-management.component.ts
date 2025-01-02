import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-measurement-management',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './measurement-management.component.html',
  styleUrl: './measurement-management.component.scss'
})
export class MeasurementManagementComponent {
  selectedCoil:string|undefined = undefined;
}
