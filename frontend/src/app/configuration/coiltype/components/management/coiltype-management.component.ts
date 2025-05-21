import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilVisualizationComponent } from '../../../../visualization/coil/components/coil-visualization.component';
import { CoiltypesService } from '../../services/coiltypes.service';
import { Coiltype } from '../../interfaces/coiltype';

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
    originalCoiltype: Coiltype | null = null; 

    public get selectedCoiltype():Coiltype|null {
      return this.coiltypesService.selectedElementCopy;
    }
    public get selectedCoiltypeId():number|undefined {
      return this.coiltypesService.selectedElementCopy?.id!;
    }
    public set selectedCoiltypeId(id:number) {
      this.coiltypesService.selectElement(Number(id));
    }

    ngOnInit() {
      if (this.selectedCoiltype) {
          this.originalCoiltype = { ...this.selectedCoiltype }; 
      }
    }

    isFieldInvalid(field: string): boolean {
      if (!this.selectedCoiltype) return false;
      let value = this.selectedCoiltype[field as keyof Coiltype];
      return value === null || value === undefined || (typeof value === 'number' && value <= 0);
    }

    hasChanges(): boolean {
      if (!this.originalCoiltype || !this.selectedCoiltype) return false;
      return JSON.stringify(this.originalCoiltype) !== JSON.stringify(this.selectedCoiltype);
    }
    
    async saveChanges() {
      if (!this.selectedCoiltype) return;
  
      this.saveError = true; 
  
      const requiredFields = ['name', 'bandbreite', 'schichthoehe', 'durchmesser', 'toleranzbereich'];
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
  
          this.saveError = false; // Fehlerprüfung zurücksetzen
          this.originalCoiltype = { ...this.selectedCoiltype };
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

