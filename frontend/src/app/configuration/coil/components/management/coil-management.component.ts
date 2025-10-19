import { Component, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoilsService } from '../../services/coils.service';
import { CoiltypesService } from '../../../coiltype/services/coiltypes.service';
import { Coil } from '../../interfaces/coil';
import { Coiltype } from '../../../coiltype/interfaces/coiltype';

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
    this.coiltypesService.reloadElements();
  }

  saveMessage: string | null = null;
  saveError: boolean = false;
  selectedCoilIsNew: boolean = false;
  originalCoil: Coil | null = null;

  ngOnInit() {
    this.syncOriginalCoilSnapshot();
  }

  public get selectedCoil(): Coil | null {
    //console.log(this.coilsService.selectedCoilCopy);
    //this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)!
    return this.coilsService.selectedElementCopy;
  }

  public get selectedCoilId(): number | undefined {
    return this.coilsService.selectedElementCopy?.id!;
  }
  public set selectedCoilId(id: number) {
    this.coilsService.selectElement(Number(id));
  }

  public get selectedCoiltype(): Coiltype|null {
    console.log(this.selectedCoil);

    if (this.selectedCoil?.coiltype ?? null !== null) {
      return this.selectedCoil?.coiltype!;
    }

    return this.coiltypesService.elements.find(c => c.id === this.selectedCoil?.coiltypeId) ?? null;
  }

  hasChanges(): boolean {
    if (!this.selectedCoil) return false;

    // For new coils, compare against the default blank element rather than an "original" snapshot
    if (this.coilsService.selectedElementIsNew || this.selectedCoil.id == null || this.selectedCoil.id === 0) {
      const s = this.selectedCoil;
      const nonEmpty = (
        (s.auftragsnummer?.trim()?.length ?? 0) > 0 ||
        (s.auftragsPosNr?.toString()?.trim()?.length ?? 0) > 0 ||
        (s.einheit ?? 0) > 0 ||
        (s.bemessungsspannung ?? 0) > 0 ||
        (s.bemessungsfrequenz ?? 0) > 0 ||
        (s.coiltypeId ?? null) !== null
      );
      return nonEmpty;
    }

    if (!this.originalCoil) return false;
    return JSON.stringify(this.originalCoil) !== JSON.stringify(this.selectedCoil);
 }

  isFieldInvalid(field: string): boolean {
    if (!this.selectedCoil) return false;
    let value = this.selectedCoil[field as keyof Coil];
    return value === null || value === undefined || (typeof value === 'number' && value <= 0);
  }


  openCoiltypeSelect() {
    this.coiltypesService.selectedElementCopy = null;
    this.coiltypesService.isCoilSelector = true;

    this.router.navigate(['/coiltype-management']);
  }

  async saveChanges() {
    if (!this.selectedCoil) return;

    this.saveError = true; // Fehlerprüfung aktivieren

    const requiredFields = ['einheit', 'auftragsPosNr', 'bemessungsfrequenz', 'bemessungsspannung'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
        this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
        return;
    }

    try {
        await this.coilsService.updateOrCreateElement(this.selectedCoil);
        await this.onCoilSelectionChange(this.selectedCoilId!);

        this.saveMessage = "Änderungen gespeichert!";
        setTimeout(() => {
            this.saveMessage = null;
        }, 3000);

        this.saveError = false;
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

    await this.coilsService.selectElement(coilIdNumber);
    this.syncOriginalCoilSnapshot();
    this.saveError = false;
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async deleteCoil(): Promise<void> {
    this.showDeleteModal = false;

    if (this.coilsService.selectedElementCopy === null) {
      return;
    }

    await this.coilsService.deleteElement(this.coilsService.selectedElementCopy.id!);
  }

  backToListing(): void {
    this.coilsService.selectedElementCopy = null;
    this.originalCoil = null;
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
    const coil = this.coilsService.elements.find(coil => coil.id === this.selectedCoilId);
    const coiltype = this.coiltypesService.elements.find(type => type.id === this.selectedCoil?.coiltypeId);
    return coiltype ? coiltype.name : 'Spulentyp auswählen';
  }

  private syncOriginalCoilSnapshot(): void {
    const selected = this.selectedCoil;

    if (!selected) {
      this.originalCoil = null;
      return;
    }

    // Do not overwrite the original snapshot if we're still working on the
    // same (new) element – this preserves "hasChanges()" when navigating
    // to selector pages (e.g., Spulentyp wählen) and back.
    if (this.originalCoil === null) {
      if (this.coilsService.selectedElementIsNew || selected.id == null || selected.id === 0) {
        this.originalCoil = { ...selected };
        return;
      }
    } else {
      // If the selected element changed (different id), update snapshot
      const currentId = selected.id ?? 0;
      const originalId = this.originalCoil.id ?? 0;
      if (currentId !== originalId && currentId !== 0) {
        try {
          this.originalCoil = this.coilsService.getCopyElement(currentId);
          return;
        } catch (_) {
          this.originalCoil = { ...selected };
          return;
        }
      }
      // Otherwise keep existing snapshot to maintain change tracking
      return;
    }

    try {
      this.originalCoil = this.coilsService.getCopyElement(selected.id);
    } catch (error) {
      this.originalCoil = { ...selected };
    }
  }
}
