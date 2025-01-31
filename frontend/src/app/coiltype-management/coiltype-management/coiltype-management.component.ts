import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { Coil } from '../../data/coil-data/coil';

@Component({
  selector: 'app-coiltype-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './coiltype-management.component.html',
  styleUrl: './coiltype-management.component.scss'
})
export class CoiltypeManagementComponent {
    constructor(public coiltypesService:CoiltypesService) {

    }
    saveMessage: string | null = null;

    public get selectedCoiltype():Coiltype|null {
      return this.coiltypesService.selectedCoiltypeCopy;
    }
    public get selectedCoiltypeId():number|undefined {
      return this.coiltypesService.selectedCoiltypeCopy?.id!;
    }
    public set selectedCoiltypeId(id:number) {
      this.coiltypesService.selectCoiltype(Number(id));
    }

    isFieldInvalid(field: string): boolean {
      if(!this.selectedCoiltype) return true;

      let value = this.selectedCoiltype[field as keyof Coiltype]

      if (value === null || value === undefined){
        return true;
      }

      if (typeof value === 'string' && field == 'tk_Name'){
        return true;
      }

      if (typeof value === 'number' && (field === 'schenkel' || field === 'bb' || field === 'sh' || field === 'dm')) {
        return value <= 0;
      }
    
      return false;
    }

    async saveChanges() {
      if (this.coiltypesService.selectedCoiltypeCopy === null) {
        return;
      }

      if (typeof this.coiltypesService.selectedCoiltypeCopy.id !== 'number') {
        // This can happen if Angular sets selectedCoiltypeId to a string for some reason
        throw new Error('selectedCoiltypeId is not of type number');
      }

      // TODO: Fix invalid fields
      //const invalidFields = ['ur', 'einheit', 'auftragsNr', 'auftragsPosNr', 'omega'].filter(field => this.isFieldInvalid(field));

      //if (invalidFields.length > 0) {
      //  alert('Bitte füllen Sie alle Pflichtfelder korrekt aus.');
      //  return;
      //}

      //const coiltype: Coiltype | undefined = this.coiltypesService.coiltypes.find(c => c.id === this.selectedCoiltypeId!);

      /*if (coiltype === undefined) {
        throw new Error(`Coiltype with ID ${this.selectedCoiltypeId} not found`);
      }*/

        try{
          await this.coiltypesService.updateOrCreateCoiltype(this.selectedCoiltype!);

          this.onCoiltypeSelectionChange(this.selectedCoiltypeId!);
    
          this.saveMessage = 'Änderungen gespeichert!';
          setTimeout(() => {
            this.saveMessage = null;
          }, 3000);
        }catch(e){
          this.saveMessage = 'Speichern fehlgeschlagen! Fülle alle Pflichtfelder aus';
        setTimeout(() => {
          this.saveMessage = null;
        }, 5000);
        }
    }

    async onCoiltypeSelectionChange(coiltypeId: number) {
      const coiltypeIdNumber:number = Number(coiltypeId);

      await this.coiltypesService.selectCoiltype(coiltypeIdNumber);
    }

    showDeleteModal = false;

    openDeleteModal(): void {
      this.showDeleteModal = true;
    }

    async deleteCoiltype(): Promise<void> {
      this.showDeleteModal = false;

      if (this.coiltypesService.selectedCoiltypeCopy === null) {
        return;
      }

      await this.coiltypesService.deleteCoiltype(this.coiltypesService.selectedCoiltypeCopy.id!);
    }

    backToListing():void {
      this.coiltypesService.selectedCoiltypeCopy = null;
    }

    
}

