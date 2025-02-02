import { Injectable } from '@angular/core';
import { Coil } from './coil';
import { NonNullAssert } from '@angular/compiler';
import { BackendService } from '../../backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoilsService {
  public coils: Coil[] = [];
  public selectedCoilCopy: Coil|null = null;
  public selectedCoilIsNew: boolean = false;

  constructor(private backendService:BackendService) { }

  public getCopyCoil(id:number):Coil {
    id = Number(id);

    const original:Coil|undefined = this.coils.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coil with ID ${id} not found.`);
    }
    
    return {...original};
  }
  

  public async reloadCoils():Promise<void> {
    this.coils = await this.backendService.getAllCoils();
  }
  
  public async reloadCoilWithId(id:number):Promise<Coil> {
    id = Number(id);

    const coil:Coil = await this.backendService.getCoil(id);
    const index:number = this.coils.findIndex(c => c.id === id);
    if (index === -1) {
      this.coils.push(coil);
    } else {
      this.coils[index] = coil;
    }

    return coil;  
  }
  
  public async updateOrCreateCoil(coil:Coil):Promise<void> {
    if (this.selectedCoilIsNew) {
      this.selectedCoilCopy = await this.postSelectedCoil();
      this.selectedCoilIsNew = false;
      return;
    }

    await this.backendService.updateCoil(coil);
  }  

  private async postSelectedCoil():Promise<Coil> {
    if (this.selectedCoilCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:Coil = await this.backendService.addCoil(this.selectedCoilCopy);

    this.coils.push(response);

    return response;
  }

  public async deleteCoil(id: number): Promise<void> {
    id = Number(id);

    const index = this.coils.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coil with ID ${id} not found.`);
    }

    await this.backendService.deleteCoil(this.coils[index]);

    this.coils.splice(index, 1);
    this.selectedCoilCopy = null;
  }

  public async selectCoil(coilId: number) {
    this.selectedCoilIsNew = false;

    const coilIdNumber: number = Number(coilId);
    console.log('Lade Spule mit ID:', coilIdNumber);
    await this.reloadCoilWithId(coilIdNumber);
  
    this.selectedCoilCopy = this.getCopyCoil(coilIdNumber);
    console.log('selectedCoilCopy nach Laden:', this.selectedCoilCopy);
  }
  
}
