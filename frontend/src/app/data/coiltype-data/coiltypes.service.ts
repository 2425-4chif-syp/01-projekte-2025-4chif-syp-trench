import { Injectable } from '@angular/core';
import { Coiltype } from './coiltype';

@Injectable({
  providedIn: 'root'
})
export class CoiltypesService {
  public coiltypes: Coiltype[] = [];
  public selectedCoiltypeCopy:Coiltype|null = null;

  constructor() { }

  public getCopyCoiltype(id:number):Coiltype {
    id = Number(id);

    const original:Coiltype|undefined = this.coiltypes.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }
    
    return {...original};
  }

  public addNewCoiltype():Coiltype {
    const newId:number = this.coiltypes.map(c => c.id).reduce((a, b) => Math.max(a!, b!), 0)! + 1;
    
    const newCoiltype:Coiltype = {
      id: newId,
      tK_Name: '',
      schenkel: 2,
      bb: null,
      sh: null,
      dm: null,
    };

    this.coiltypes.push(newCoiltype);

    return newCoiltype;
  }

  public deleteCoiltype(id: number): void {
    id = Number(id);

    const index = this.coiltypes.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }

    this.coiltypes.splice(index, 1);
    this.selectedCoiltypeCopy = null;
  }

  selectCoiltype(coilId: number) {
    // Not sure why I have to cast the coilId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coilId as a string, despite what the type definition says.
    const coiltypeIdNumber:number = Number(coilId);
    this.selectedCoiltypeCopy = this.getCopyCoiltype(coiltypeIdNumber);
  }
}
