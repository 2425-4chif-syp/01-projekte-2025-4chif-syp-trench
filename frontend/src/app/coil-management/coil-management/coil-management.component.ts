import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService:CoilsService) {} 

  selectedNumber: number = 2;
  name: string = ''; 
  bandbreite: number | null = null; 
  schichthoehe: number | null = null;
  durchmesser: number | null = null;

  saveMessage: string | null = null;

  public get selectedCoilId():number|undefined {
    return this.coilsService.selectedCoilCopy?.id;
  }
  public set selectedCoilId(id:number) {
    this.coilsService.selectCoil(Number(id));
  }

  addNewCoil() {
    const newCoil: Coil = this.coilsService.addNewCoil();

    this.coilsService.selectCoil(newCoil.id);
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
    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.coilsService.selectedCoilCopy.id !== 'number') {
      // This can happen if Angular sets selectedCoilId to a string for some reason
      throw new Error('selectedCoilId is not of type number'); 
    }
    
    const invalidFields = ['diameter', 'arcLength', 'endArea'].filter(field => this.isFieldInvalid(field));
    
    if (invalidFields.length > 0) {
      alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      return;
    }
  
    this.coilsService.selectCoil(this.coilsService.selectedCoilCopy.id);

    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }

  onCoilSelectionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const coilId = Number(selectElement.value);
    this.coilsService.selectCoil(coilId);
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  deleteCoil(): void {
    this.showDeleteModal = false;

    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    this.coilsService.deleteCoil(this.coilsService.selectedCoilCopy.id);
  }

  backToListing():void {
    this.coilsService.selectedCoilCopy = null;
  }
}

