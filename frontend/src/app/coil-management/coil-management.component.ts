import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Coil } from '../coil-data/coil';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../coil-data/coils.service';

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService:CoilsService) {}  

  selectedCoil:Coil|undefined = undefined;

  yokesCount: number = 2; // Standardwert für die Jochanzahl
  name: string = ''; // Spulenname
  diameter: number | null = null; // Durchmesser in mm
  arcLength: number | null = null; // Bogenlänge in mm
  endArea: number | null = null; // Stirnfläche in mm²
  tolerance: number = 0; // Zulässige Toleranz in %

  getSvgPath(): string {
    return `assets/svg/${this.yokesCount}RJ.svg`;
  }

  addNewCoil() { 
    
  }
}
