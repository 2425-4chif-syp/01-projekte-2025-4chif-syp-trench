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
  originalCoil: Coil | null = null;

  ngOnInit() {
    if (this.selectedCoil) {
        this.originalCoil = { ...this.selectedCoil }; // Erstellt eine Kopie der Originalwerte
    }
}

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

  hasChanges(): boolean {
    if (!this.originalCoil || !this.selectedCoil) return false;
    return JSON.stringify(this.originalCoil) !== JSON.stringify(this.selectedCoil);
}

  isFieldInvalid(field: string): boolean {
    if (!this.selectedCoil) return false;
    let value = this.selectedCoil[field as keyof Coil];
    return value === null || value === undefined || (typeof value === 'number' && value <= 0);
  }

  
  openCoiltypeSelect() {
    this.coiltypesService.selectedCoiltypeCopy = null;
    this.coiltypesService.isCoilSelector = true;

    this.router.navigate(['/coiltype-management']);
  }

  async saveChanges() {
    if (!this.selectedCoil) return;

    this.saveError = true; // Fehlerprüfung aktivieren

    const requiredFields = ['ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
        this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
        return;
    }

    try {
        await this.coilsService.updateOrCreateCoil(this.selectedCoil);
        this.onCoilSelectionChange(this.selectedCoilId!);

        this.saveMessage = "Änderungen gespeichert!";
        setTimeout(() => {
            this.saveMessage = null;
        }, 3000);

        this.saveError = false;
        this.originalCoil = { ...this.selectedCoil }; // Speichern der neuen Originalwerte
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        this.saveMessage = "Fehler beim Speichern!";
    }
}



  writeSaveMessage(message:string) {
    this.saveMessage = message;
    setTimeout(() => {
      this.saveMessage = null;
    }, 1500);
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

