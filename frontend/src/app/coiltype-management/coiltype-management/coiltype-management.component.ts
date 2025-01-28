import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';

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

    async addNewCoiltype() {
      const newCoiltype: Coiltype = await this.coiltypesService.addNewCoiltype();
      this.coiltypesService.selectCoiltype(newCoiltype.id!);
      this.onCoiltypeSelectionChange(newCoiltype.id!);
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

      const coiltype: Coiltype | undefined = this.coiltypesService.coiltypes.find(c => c.id === this.selectedCoiltypeId!);

      if (coiltype === undefined) {
        throw new Error(`Coiltype with ID ${this.selectedCoiltypeId} not found`);
      }

      await this.coiltypesService.updateCoiltype(this.selectedCoiltype!);

      this.onCoiltypeSelectionChange(this.selectedCoiltypeId!);

      this.saveMessage = 'Änderungen gespeichert!';
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);
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

