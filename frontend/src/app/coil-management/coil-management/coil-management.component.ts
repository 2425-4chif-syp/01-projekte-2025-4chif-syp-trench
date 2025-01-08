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
  constructor(public coilsService:CoilsService) {
    
  } 
  saveMessage: string | null = null;

  public get selectedCoil():Coil|null {
    return this.coilsService.selectedCoilCopy;
  }
  public get selectedCoilId():number|undefined {
    return this.coilsService.selectedCoilCopy?.id!;
  }
  public set selectedCoilId(id:number) {
    this.coilsService.selectCoil(Number(id));
  }

  async addNewCoil() {
    const newCoil: Coil = await this.coilsService.addNewCoil();
    this.coilsService.selectCoil(newCoil.id!);
    this.onCoilSelectionChange(newCoil.id!);
  }

  isFieldInvalid(field: string): boolean {
    /*if (field === 'bandbreite' && this.bandbreite === null) {
      return true;
    }
    if (field === 'schichthoehe' && this.schichthoehe === null) {
      return true;
    }
    if (field === 'durchmesser' && this.durchmesser === null) {
      return true;
    }*/
    return false;
  } 
  
  async saveChanges() {
    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.coilsService.selectedCoilCopy.id !== 'number') {
      // This can happen if Angular sets selectedCoilId to a string for some reason
      throw new Error('selectedCoilId is not of type number'); 
    }
    
    const invalidFields = ['ur', 'einheit', 'auftragsNr', 'auftragsPosNr', 'omega'].filter(field => this.isFieldInvalid(field));
    
    if (invalidFields.length > 0) {
      alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      return;
    }

    const coil: Coil | undefined = this.coilsService.coils.find(c => c.id === this.selectedCoilId!);
  
    if (coil === undefined) {
      throw new Error(`Coil with ID ${this.selectedCoilId} not found`);
    }

    await this.coilsService.updateCoil(this.selectedCoil!);

    this.onCoilSelectionChange(this.selectedCoilId!);

    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }

  async onCoilSelectionChange(coilId: number) {
    const coilIdNumber:number = Number(coilId);
    
    await this.coilsService.selectCoil(coilIdNumber);
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

    this.coilsService.deleteCoil(this.coilsService.selectedCoilCopy.id!);
  }

  backToListing():void {
    this.coilsService.selectedCoilCopy = null;
  }
}

