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
  yokesCount: number = 2; // Standardwert für die Jochanzahl
  name: string = ''; // Spulenname
  diameter: number | null = null; // Durchmesser in mm
  arcLength: number | null = null; // Bogenlänge in mm
  endArea: number | null = null; // Stirnfläche in mm²
  tolerance: number = 0; // Zulässige Toleranz in %

  getSvgPath(): string {
    return `assets/svg/${this.yokesCount}RJ.svg`;
  }
}
