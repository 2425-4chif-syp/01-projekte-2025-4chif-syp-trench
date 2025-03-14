import { Component, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { MeasurementManagementComponent } from '../../measurement-management/measurement-management.component';
import { Router } from '@angular/router';
//import { MeasuringProbeMeasurementComponent } from "./measuring-probe-measurement/measuring-probe-measurement.component";

@Component({
  selector: 'app-coil-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coil-management.component.html',
  styleUrl: './coil-management.component.scss'
})
export class CoilManagementComponent {
  constructor(public coilsService: CoilsService, private coiltypesService: CoiltypesService, private router:Router) {
    this.coiltypesService.isCoilSelector = false;
    this.coiltypesService.reloadCoiltypes();
  }

  saveMessage: string | null = null;  
  saveError: boolean = false;
  selectedCoilIsNew: boolean = false;

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

  public get selectedCoiltype(): Coiltype|null {
    console.log(this.selectedCoil);

    if (this.selectedCoil?.coiltype ?? null !== null) {
      return this.selectedCoil?.coiltype!;
    }

    return this.coiltypesService.coiltypes.find(c => c.id === this.selectedCoil?.coiltypeId) ?? null;
  }

  isFieldInvalid(field: string): boolean {
    if (!this.selectedCoil) return true;
  
    let value = this.selectedCoil[field as keyof Coil];

    if (value === null || value === undefined) {
        return true;
    }
    
    if (typeof value === 'number' && (field === 'ur' || field === 'einheit' || field === 'auftragsnummer' || field === 'auftragsPosNr' || field === 'omega')) {
      return value <= 0;
    }
  
    // Allgemeine Prüfung für alle anderen Fälle
    return false;
  }
  
  openCoiltypeSelect() {
    this.coiltypesService.selectedCoiltypeCopy = null;
    this.coiltypesService.isCoilSelector = true;

    this.router.navigate(['/coiltype-management']);
  }

  async saveChanges() {
    if (this.coilsService.selectedCoilCopy === null) {
      return;
    }

    if (typeof this.coilsService.selectedCoilCopy.id !== 'number') {
      throw new Error('selectedCoilId is not of type number');
    }

    // Check all required fields
    if (this.selectedCoiltype === null) {
      this.writeSaveMessage('Bitte wählen Sie einen Spulentypen aus.');
    }

    const requiredFields = ['coiltype', 'ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
      this.writeSaveMessage('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    await this.coilsService.updateOrCreateCoil(this.selectedCoil!);
    this.onCoilSelectionChange(this.selectedCoilId!);

    this.writeSaveMessage('Änderungen gespeichert!');
  }

  writeSaveMessage(message:string) {
    this.saveMessage = message;
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
    //console.log(this.coilsService.selectCoil);
    this.showCoiltypeDropdown = !this.showCoiltypeDropdown;
  }

  selectCoiltype(coiltypeId: number) {
    if (this.selectedCoil !== null) {
      this.selectedCoil.coiltypeId = coiltypeId;
    } else {
      console.error('selectedCoil is null');
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

