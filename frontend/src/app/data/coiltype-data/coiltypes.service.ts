import { Injectable } from '@angular/core';
import { Coiltype } from './coiltype';
import { BackendService } from '../../backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoiltypesService {
  public coiltypes: Coiltype[] = [];
  public selectedCoiltypeCopy:Coiltype|null = null;

  constructor(private backendService:BackendService) {

}
public sortDirection: { [key: string]: boolean } = {};

  public getCopyCoiltype(id:number):Coiltype {
    id = Number(id);

    const original:Coiltype|undefined = this.coiltypes.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }
    
    return {...original};
  }

  public async reloadCoiltypes():Promise<void> {
    this.coiltypes = await this.backendService.getAllCoiltypes();
  }
  public async reloadCoiltypeWithId(id:number):Promise<Coiltype> {
    id = Number(id);

    const coiltype:Coiltype = await this.backendService.getCoiltype(id);
    const index:number = this.coiltypes.findIndex(c => c.id === id);
    if (index === -1) {
      this.coiltypes.push(coiltype);
    } else {
      this.coiltypes[index] = coiltype;
    }

    return coiltype;  
  }
  
  public async updateCoiltype(coiltype:Coiltype):Promise<void> {
    await this.backendService.updateCoiltype(coiltype);
  }

  public async addNewCoiltype():Promise<Coiltype> {
    //const newId:number = this.coiltypes.map(c => c.id).reduce((a, b) => Math.max(a!, b!), 0)! + 1;
    
    const newCoiltype:Coiltype = {
      id: 0,
      tK_Name: '',
      schenkel: 0,
      bb: 0,
      sh: 0,
      dm: 0
    };

    const response:Coiltype = await this.backendService.addCoiltype(newCoiltype);

    this.coiltypes.push(response);

    return response;
  }

  public async deleteCoiltype(id: number): Promise<void> {
    id = Number(id);

    const index = this.coiltypes.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }

    await this.backendService.deleteCoiltype(this.coiltypes[index]);

    this.coiltypes.splice(index, 1);
    this.selectedCoiltypeCopy = null;
  }

  public async selectCoiltype(coiltypeId: number) {
    // Not sure why I have to cast the coiltypeId to a number here, but it seems to be necessary. 
    // Angular seems to pass the coiltypeId as a string, despite what the type definition says.
    const coiltypeIdNumber:number = Number(coiltypeId);

    await this.reloadCoiltypeWithId(coiltypeIdNumber);

    this.selectedCoiltypeCopy = this.getCopyCoiltype(coiltypeIdNumber);
  }
}
