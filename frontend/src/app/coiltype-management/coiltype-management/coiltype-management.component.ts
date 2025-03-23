import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { CoilVisualizationComponent } from '../../coil-visualization/coil-visualization.component';

@Component({
  selector: 'app-coiltype-management',
  standalone: true,
  imports: [FormsModule, CommonModule, CoilVisualizationComponent],
  templateUrl: './coiltype-management.component.html',
  styleUrl: './coiltype-management.component.scss'
})
export class CoiltypeManagementComponent {
    constructor(public coiltypesService:CoiltypesService) { }
    saveError: boolean = false;
    saveMessage: string | null = null;

    public get selectedCoiltype():Coiltype|null {
      return this.coiltypesService.selectedElementCopy;
    }
    public get selectedCoiltypeId():number|undefined {
      return this.coiltypesService.selectedElementCopy?.id!;
    }
    public set selectedCoiltypeId(id:number) {
      this.coiltypesService.selectElement(Number(id));
    }

    isFieldInvalid(field: string): boolean {
      if (!this.selectedCoiltype) return false;
      let value = this.selectedCoiltype[field as keyof Coiltype];
      return value === null || value === undefined || (typeof value === 'number' && value <= 0);
    }
    
    async saveChanges() {
      if (!this.selectedCoiltype) {
          return;
      }
  
      this.saveError = true; // Fehlerprüfung aktivieren
  
      // Pflichtfelder prüfen
      const requiredFields = ['tK_Name', 'bb', 'sh', 'dm'];
      const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));
  
      if (invalidFields.length > 0) {
          this.saveMessage = "Bitte füllen Sie alle Pflichtfelder korrekt aus.";
          return;
      }
  
      try {
          await this.coiltypesService.updateOrCreateElement(this.selectedCoiltype);
          this.onCoiltypeSelectionChange(this.selectedCoiltypeId!);
  
          this.saveMessage = "Änderungen gespeichert!";
          setTimeout(() => {
              this.saveMessage = null;
          }, 1500);
          this.backToListing();
          this.saveError = false; // Fehlerprüfung zurücksetzen
      } catch (error) {
          console.error("Fehler beim Speichern:", error);
          this.saveMessage = "Fehler beim Speichern!";
      }
  }
  

    async onCoiltypeSelectionChange(coiltypeId: number) {
      const coiltypeIdNumber:number = Number(coiltypeId);

      await this.coiltypesService.selectElement(coiltypeIdNumber);
    }

    showDeleteModal = false;

    openDeleteModal(): void {
      this.showDeleteModal = true;
    }

    async deleteCoiltype(): Promise<void> {
      this.showDeleteModal = false;

      if (this.coiltypesService.selectedElementCopy === null) {
        return;
      }

      await this.coiltypesService.deleteElement(this.coiltypesService.selectedElementCopy.id!);
    }

    backToListing():void {
      this.coiltypesService.selectedElementCopy = null;
    }
}

