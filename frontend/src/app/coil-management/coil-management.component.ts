import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../data/coil-data/coils.service';
import { Coil } from '../data/coil-data/coil';

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService:CoilsService) {}  

  selectedCoilCopy:Coil|null = null;

  saveMessage: string | null = null;

  addNewCoil() {
    const newCoil: Coil = this.coilsService.addNewCoil();

    this.selectCoil(newCoil.id);
  }

  isFieldInvalid(field: string): boolean {
    //if (field === 'diameter' && (this.diameter === null || this.diameter <= 0)) {
    //  return true;
    //}
    //if (field === 'arcLength' && (this.arcLength === null || this.arcLength <= 0)) {
    //  return true;
    //}
    //if (field === 'endArea' && (this.endArea === null || this.endArea <= 0)) {
    //  return true;
    //}
    return false;
  } 
  
  saveChanges() {
    if (this.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.selectedCoilCopy.id !== 'number') {
      // This can happen if Angular sets selectedCoilId to a string for some reason
      throw new Error('selectedCoilId is not of type number'); 
    }
    
    const invalidFields = ['diameter', 'arcLength', 'endArea'].filter(field => this.isFieldInvalid(field));
    
    if (invalidFields.length > 0) {
      alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      return;
    }
  
    this.selectCoil(this.selectedCoilCopy.id);

    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }

  onCoilSelectionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const coilId = Number(selectElement.value);
    this.selectCoil(coilId);
  }

  selectCoil(coilId: number) {
    // Not sure why I have to cast the coilId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coilId as a string, despite what the type definition says.
    const coilIdNumber:number = Number(coilId);
    this.selectedCoilCopy = this.coilsService.getCopyCoil(coilIdNumber);
  }

  showDeleteModal = false;

  onDelete(): void {
    this.showDeleteModal = true;
  }

  deleteCoil(): void {
    if (this.selectedCoilCopy === null) {
      return;
    }

    this.coilsService.deleteCoil(this.selectedCoilCopy.id);
  }
}

