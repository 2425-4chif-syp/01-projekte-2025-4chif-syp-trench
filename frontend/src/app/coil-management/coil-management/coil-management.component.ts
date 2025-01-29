import { Component, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { MeasurementManagementComponent } from '../../measurement-management/measurement-management.component';
//import { MeasuringProbeMeasurementComponent } from "./measuring-probe-measurement/measuring-probe-measurement.component";

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService: CoilsService, public coiltypesService: CoiltypesService) {
    this.coiltypesService.reloadCoiltypes();
  }

  saveMessage: string | null = null;

  public get selectedCoil(): Coil | null {
    //console.log(this.coilsService.selectedCoilCopy);
    //this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)! 
    return this.coilsService.selectedCoilCopy;
  }
  public get selectedCoilId(): number | undefined {
    return this.coilsService.selectedCoilCopy?.id!;
  }
  public set selectedCoilId(id: number) {
    this.coilsService.selectCoil(Number(id));
  }

  async addNewCoil() {
    const newCoil: Coil = await this.coilsService.addNewCoil();
    this.coilsService.selectCoil(newCoil.id!);
    this.onCoilSelectionChange(newCoil.id!);
  }

  isFieldInvalid(field: string): boolean {
    if (!this.selectedCoil) return true;
  
    let value = this.selectedCoil[field as keyof Coil];
    console.log(`Checking field ${field}:`, typeof value); // Hier siehst du den aktuellen Wert und Typ

    if (value === null || value === undefined || typeof value  === 'string') {
      return true;
    }
    
   if (typeof value === 'number' && (field === 'ur' || field === 'einheit' || field === 'auftragsnummer' || field === 'auftragsPosNr' || field === 'omega')) {
      return value <= 0;
    }
  
    // Allgemeine Prüfung für alle anderen Fälle
    return false;
  }
  

  async saveChanges() {
    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.coilsService.selectedCoilCopy.id !== 'number') {
      throw new Error('selectedCoilId is not of type number');
    }

    // Check all required fields
    const requiredFields = ['coiltype', 'ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
      this.saveMessage = 'Bitte füllen Sie alle Pflichtfelder aus.';
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);
      return;
    }

    await this.coilsService.updateCoil(this.selectedCoil!);
    this.onCoilSelectionChange(this.selectedCoilId!);

    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }

  async onCoilSelectionChange(coilId: number) {
    const coilIdNumber: number = Number(coilId);

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

  backToListing(): void {
    this.coilsService.selectedCoilCopy = null;
  }

  showCoiltypeDropdown: boolean = false;

  toggleCoiltypeDropdown() {
    console.log(this.coilsService.selectCoil)
    this.showCoiltypeDropdown = !this.showCoiltypeDropdown;
  }

  selectCoiltype(coiltypeId: number) {
    if (this.selectedCoil) {
      console.log(this.coiltypesService.coiltypes)
      console.log('Aktueller Zustand von selectedCoil:', this.selectedCoil);
      console.log('Vorher coiltypeId:', this.selectedCoil.coiltypeId);
      this.selectedCoil.coiltypeId = coiltypeId;
      console.log("Test", this.selectedCoil)
      console.log('Nachher coiltypeId:', this.selectedCoil.coiltypeId);
    } else {
      console.error('selectedCoil ist null oder undefined!');
    }
    this.showCoiltypeDropdown = false;
  }


  getCoiltypeName(): string {
    if (!this.selectedCoilId) return 'Spulentyp auswählen';
    const coil = this.coilsService.coils.find(coil => coil.id === this.selectedCoilId);
    const coiltype = this.coiltypesService.coiltypes.find(type => type.id === this.selectedCoil?.coiltypeId);
    return coiltype ? coiltype.tK_Name : 'Spulentyp auswählen';
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

