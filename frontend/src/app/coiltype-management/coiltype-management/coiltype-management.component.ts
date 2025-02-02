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
    hasSaved: boolean = false;

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
      if(!this.hasSaved) return false;
      if(!this.selectedCoiltype) return true;

      let value = this.selectedCoiltype[field as keyof Coiltype]

      if (field === 'numberSelect' && this.selectedCoiltype.schenkel == 0){
        return true;
      }

      if (value === null || value === undefined && field != 'numberSelect'){
        return true;
      }


      if (typeof value === 'string' && field == 'tK_Name' && value === ''){
        return true;
      }

      if (typeof value === 'number' && (field === 'bb' || field === 'sh' || field === 'dm')) {
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
        try{
          if(this.selectedCoiltype?.tK_Name.length == 0){
            throw new Error("Name ist leer");
          }
          await this.coiltypesService.updateOrCreateCoiltype(this.selectedCoiltype!);

          this.onCoiltypeSelectionChange(this.selectedCoiltypeId!);
    
          this.saveMessage = 'Änderungen gespeichert!';
          this.hasSaved = true;
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

