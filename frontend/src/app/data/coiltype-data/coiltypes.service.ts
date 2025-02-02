import { Injectable } from '@angular/core';
import { Coiltype } from './coiltype';
import { BackendService } from '../../backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoiltypesService {
  public coiltypes: Coiltype[] = [];
  public selectedCoiltypeCopy:Coiltype|null = null;
  public selectedCoiltypeIsNew: boolean = false;

  public isCoilSelector:boolean = false;

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
  
  public async updateOrCreateCoiltype(coiltype:Coiltype):Promise<void> {
    if (this.selectedCoiltypeIsNew) {
      this.selectedCoiltypeCopy = await this.postSelectedCoiltype();
      this.selectedCoiltypeIsNew = false;
      return;
    }

    await this.backendService.updateCoiltype(coiltype);
  }

  private async postSelectedCoiltype():Promise<Coiltype> {
    if (this.selectedCoiltypeCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:Coiltype = await this.backendService.addCoiltype(this.selectedCoiltypeCopy);

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
    this.selectedCoiltypeIsNew = false;
    
    await this.reloadCoiltypeWithId(coiltypeIdNumber);

    this.selectedCoiltypeCopy = this.getCopyCoiltype(coiltypeIdNumber);
  }
}
