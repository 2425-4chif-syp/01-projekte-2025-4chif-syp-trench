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
      this.coiltypesService.reloadCoiltypes();
    }
    
    saveMessage: string | null = null;

    public get selectedCoiltype():Coiltype|null {
      return this.coiltypesService.selectedCoiltypeCopy;
    }
    
    public get selectedCoiltypeId():number|null {
      return this.selectedCoiltype?.id ?? null;
    }
    
    public set selectedCoiltypeId(id:number|null) {
      if (id !== null) {
        this.coiltypesService.selectCoiltype(Number(id));
      } else {
        this.coiltypesService.selectedCoiltypeCopy = null;
      }
    }

    async addNewCoiltype() {
      const newCoiltype = await this.coiltypesService.addNewCoiltype();
      this.selectedCoiltypeId = newCoiltype.id!;
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
      if (!this.selectedCoiltype) {
        return;
      }

      await this.coiltypesService.updateCoiltype(this.selectedCoiltype);
      
      this.saveMessage = 'Änderungen gespeichert!';
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);
    }

    showDeleteModal = false;

    openDeleteModal(): void {
      this.showDeleteModal = true;
    }

    async deleteCoiltype(): Promise<void> {
      this.showDeleteModal = false;

      if (!this.selectedCoiltype?.id) {
        return;
      }

      await this.coiltypesService.deleteCoiltype(this.selectedCoiltype.id);
      this.selectedCoiltypeId = null;
    }

    backToListing():void {
      this.selectedCoiltypeId = null;
    }
}

