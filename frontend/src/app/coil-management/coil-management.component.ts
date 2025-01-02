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

  selectedCoilId: number | null = null;

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
    const newCoil: Coil = this.coilsService.addNewCoil();
    this.selectedCoilId = newCoil.id;
    this.onSelectedCoilChange(newCoil.id);
  }

  saveChanges() {
    if (this.selectedCoilId === null) {
      return;
    }

    if (typeof this.selectedCoilId !== 'number') {
      // This can happen if Angular sets selectedCoilId to a string for some reason
      throw new Error('selectedCoilId is not of type number'); 
    }

    const coil:Coil|undefined = this.coilsService.coils.find(c => c.id === this.selectedCoilId!);

    if (coil === undefined) {
      throw new Error(`Coil with ID ${this.selectedCoilId} not found`);
    }

    coil.name = this.name;
    coil.yokesCount = this.yokesCount;
    // TODO: Check if the following properties are not null, if they are tell the user to fill them in
    coil.diameter = this.diameter??0;
    coil.arcLength = this.arcLength??0;
    coil.endArea = this.endArea??0;
    coil.tolerance = this.tolerance;

    this.onSelectedCoilChange(this.selectedCoilId);
  }

  onSelectedCoilChange(coilId: number) {
    // Not sure why I have to cast the coilId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coilId as a string, despite what the type definition says.
    const coilIdNumber:number = Number(coilId);
    this.selectedCoilId = coilIdNumber;
    
    const coil = this.coilsService.coils.find(c => c.id === coilIdNumber);
    
    if (coil === undefined) {
      return;
    }

    this.name = coil.name;
    this.yokesCount = coil.yokesCount;
    this.diameter = coil.diameter;
    this.arcLength = coil.arcLength;
    this.endArea = coil.endArea;
    this.tolerance = coil.tolerance;
  }
}
