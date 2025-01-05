import { Injectable } from '@angular/core';
import { Coil } from './coil';

@Injectable({
  providedIn: 'root'
})
export class CoilsService {
  public coils: Coil[] = [];
  public selectedCoilCopy:Coil|null = null;

  constructor() { }

  public getCopyCoil(id:number):Coil {
    id = Number(id);

    const original:Coil|undefined = this.coils.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coil with ID ${id} not found.`);
    }
    
    return {...original};
  }

  public addNewCoil():Coil {
    const newId:number = this.coils.map(c => c.id).reduce((a, b) => Math.max(a, b), 0) + 1;
    
    const newCoil:Coil = {
      id: newId,
      ur: 0, 
      einheit: 0,
      auftragsnummer: 0,
      auftragsPosNr: 0,
      omega: 0
    };

    this.coils.push(newCoil);

    return newCoil;
  }

  public deleteCoil(id: number): void {
    id = Number(id);

    const index = this.coils.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coil with ID ${id} not found.`);
    }

    this.coils.splice(index, 1);
  }

  selectCoil(coilId: number) {
    // Not sure why I have to cast the coilId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coilId as a string, despite what the type definition says.
    const coilIdNumber:number = Number(coilId);
    this.selectedCoilCopy = this.getCopyCoil(coilIdNumber);
  }
}
