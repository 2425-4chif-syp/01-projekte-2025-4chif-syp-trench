import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';

@Component({
  selector: 'app-coiltype-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coiltype-management.component.html',
  styleUrl: './coiltype-management.component.scss'
})
export class CoiltypeManagementComponent {
  constructor(public coiltypesService:CoiltypesService) {} 

  selectedNumber: number = 2;
  name: string = ''; 
  bandbreite: number | null = null; 
  schichthoehe: number | null = null;
  durchmesser: number | null = null;

  saveMessage: string | null = null;

  public get selectedCoiltypeId():number|undefined {
    return this.coiltypesService.selectedCoiltypeCopy?.id!;
  }
  public set selectedCoiltypeId(id:number) {
    this.coiltypesService.selectCoiltype(Number(id));
  }

  addNewCoiltype() {
    const newCoiltype: Coiltype = this.coiltypesService.addNewCoiltype();

    this.coiltypesService.selectCoiltype(newCoiltype.id!);
    this.onCoiltypeSelectionChange(newCoiltype.id!)
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
    if (this.coiltypesService.selectedCoiltypeCopy === null) {
      return;
    }

    if (typeof this.coiltypesService.selectedCoiltypeCopy.id !== 'number') {
      // This can happen if Angular sets selectedCoiltypeId to a string for some reason
      throw new Error('selectedCoiltypeId is not of type number'); 
    }
    
    const invalidFields = ['diameter', 'arcLength', 'endArea'].filter(field => this.isFieldInvalid(field));
    
    if (invalidFields.length > 0) {
      alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      return;
    }

    const coilType: Coiltype | undefined = this.coiltypesService.coiltypes.find(c => c.id === this.selectedCoiltypeId);

    if (coilType === undefined){
      throw new Error(`Coiltype with ID ${this.selectedCoiltypeId} not found`);
    }

    coilType.tK_Name = this.name;
    coilType.schenkel = this.selectedNumber;
    coilType.bb = this.bandbreite;
    coilType.sh = this.schichthoehe;
    coilType.dm = this.durchmesser;
  
    this.onCoiltypeSelectionChange(this.selectedCoiltypeId!)
    this.coiltypesService.selectCoiltype(this.coiltypesService.selectedCoiltypeCopy.id);

    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }

  onCoiltypeSelectionChange(coiltypeId: number) {
    const coilTypeIdNumber: number = Number(coiltypeId);
    this.selectedCoiltypeId = coilTypeIdNumber;

    const coilType = this.coiltypesService.coiltypes.find(c => c.id === coilTypeIdNumber);

    if (coilType === undefined){
      return;
    }

    this.name = coilType.tK_Name;
    this.selectedNumber = coilType.schenkel!;
    this.bandbreite = coilType.bb;
    this.schichthoehe = coilType.sh;
    this.durchmesser = coilType.dm;
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  deleteCoiltype(): void {
    this.showDeleteModal = false;

    if (this.coiltypesService.selectedCoiltypeCopy === null) {
      return;
    }

    this.coiltypesService.deleteCoiltype(this.coiltypesService.selectedCoiltypeCopy.id!);
  }

  backToListing():void {
    this.coiltypesService.selectedCoiltypeCopy = null;
  }
}

