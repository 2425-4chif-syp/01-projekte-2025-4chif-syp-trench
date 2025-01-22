import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { MeasurementManagementComponent } from '../../measurement-management/measurement-management.component';
import { MeasuringProbeMeasurementComponent } from "./measuring-probe-measurement/measuring-probe-measurement.component";

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule, MeasuringProbeMeasurementComponent],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService:CoilsService, public coiltypesService: CoiltypesService) {
    this.coiltypesService.reloadCoiltypes();
} 
  
  saveMessage: string | null = null;

  public get selectedCoil():Coil|null {
    //console.log(this.coilsService.selectedCoilCopy);
    //this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)! 
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
    console.log(this.coiltypesService.coiltypes);
    console.log("test: " + this.coilsService.selectedCoilCopy?.coiltypeId + " " + this.coilsService.selectedCoilCopy?.auftragsnummer)
    console.log(this.coiltypesService.coiltypes)
    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.coilsService.selectedCoilCopy.id !== 'number') {
      // This can happen if Angular sets selectedCoilId to a string for some reason
      throw new Error('selectedCoilId is not of type number'); 
    }
    
      // TODO: Fix invalid fields
      //const invalidFields = ['ur', 'einheit', 'auftragsNr', 'auftragsPosNr', 'omega'].filter(field => this.isFieldInvalid(field));

      //if (invalidFields.length > 0) {
      //  alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      //  return;
      //}
  
    const coil: Coil | undefined = this.coilsService.coils.find(c => c.id === this.selectedCoilId!);
  
    if (coil === undefined) {
      throw new Error(`Coil with ID ${this.selectedCoilId} not found`);
    }

    //this.coilTypeSelected =  this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)!;
    console.log("SSSS:" + this.selectedCoil?.coiltypeId)
    console.log(this.selectedCoil);

  
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

  async deleteCoil(): Promise<void> {
    this.showDeleteModal = false;

    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    await this.coilsService.deleteCoil(this.coilsService.selectedCoilCopy.id!);
  }

  backToListing():void {
    this.coilsService.selectedCoilCopy = null;
  }

  showCoiltypeDropdown: boolean = false;

toggleCoiltypeDropdown() {
  this.showCoiltypeDropdown = !this.showCoiltypeDropdown;
}

selectCoiltype(coiltypeId: number) {
  if (this.selectedCoil) {
    console.log('Aktueller Zustand von selectedCoil:', this.selectedCoil);
    console.log('Vorher coiltypeId:', this.selectedCoil.coiltypeId);
    this.selectedCoil.coiltypeId = coiltypeId;
    console.log('Nachher coiltypeId:', this.selectedCoil.coiltypeId);
  } else {
    console.error('selectedCoil ist null oder undefined!');
  }
  this.showCoiltypeDropdown = false;
}


getCoiltypeName(coiltypeId: number): string {
  const coiltype = this.coiltypesService.coiltypes.find(c => c.id === coiltypeId);
  return coiltype ? coiltype.tK_Name : 'Unbekannt';
}

sortTable(column: keyof Coiltype) {
  // Sortierlogik für die Tabelle
  const direction = !this.coiltypesService.sortDirection[column];
  this.coiltypesService.sortDirection[column] = direction;

  this.coiltypesService.coiltypes.sort((a, b) => {
    if (a[column]! < b[column]!) {
      return direction ? -1 : 1;
    }
    if (a[column]! > b[column]!) {
      return direction ? 1 : -1;
    }
    return 0;
  });
}

}

