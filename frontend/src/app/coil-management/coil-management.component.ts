import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  selectedNumber: number | null = null;

  getSvgPath(): string {
    return `assets/svg/${this.selectedNumber}RJ.svg`;
  }
}
