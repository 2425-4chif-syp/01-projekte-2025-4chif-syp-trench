import { Injectable } from '@angular/core';
import { Coil } from './coil';
import { NonNullAssert } from '@angular/compiler';
import { BackendService } from '../../backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoilsService {
  public coils: Coil[] = [];
  public selectedCoilCopy:Coil|null = null;

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
  
  public async updateCoil(coil:Coil):Promise<void> {
    await this.backendService.updateCoil(coil);
  }

  public async addNewCoil():Promise<Coil> {
    //const newId:number = this.coils.map(c => c.id).reduce((a, b) => Math.max(a!, b!), 0)! + 1;
    
    const newCoil:Coil = {
      id: 0,
      ur: 0, 
      einheit: 0,
      auftragsnummer: 0,
      auftragsPosNr: 0,
      omega: 0
    };

    const response:Coil = await this.backendService.addCoil(newCoil);

    this.coils.push(response);

    return response;
  }

  public deleteCoil(id: number): void {
    id = Number(id);

    const index = this.coils.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coil with ID ${id} not found.`);
    }

    this.coils.splice(index, 1);
    this.selectedCoilCopy = null;
  }

  async selectCoil(coilId: number) {
    // Not sure why I have to cast the coilId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coilId as a string, despite what the type definition says.
    const coilIdNumber:number = Number(coilId);

    await this.reloadCoilWithId(coilIdNumber);

    this.selectedCoilCopy = this.getCopyCoil(coilIdNumber);
  }
}
