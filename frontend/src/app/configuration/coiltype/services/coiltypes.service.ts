import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Coiltype } from '../interfaces/coiltype';
import { CoiltypesBackendService } from './coiltypes-backend.service';
@Injectable({
  providedIn: 'root'
})
export class CoiltypesService implements ListService<Coiltype> {
  public elements: Coiltype[] = [];
  public selectedElementCopy:Coiltype|null = null;
  public selectedElementIsNew: boolean = false;

  public isCoilSelector:boolean = false;

  constructor(private coiltypesBackendService:CoiltypesBackendService) {
  }
  public sortDirection: { [key: string]: boolean } = {};

  public get newElement(): Coiltype {
    return {
      id: 0,
      name: '',
      schenkel: 0,
      bandbreite: null,
      schichthoehe: null,
      durchmesser: null,
      toleranzbereich: null,
      notiz: ''
    };
  }

  public getCopyElement(id:number):Coiltype {
    id = Number(id);

    const original:Coiltype|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }

    return {...original};
  }

  public async reloadElements():Promise<void> {
    this.elements = await this.coiltypesBackendService.getAllCoiltypes();
  }

  public async reloadElementWithId(id:number):Promise<Coiltype> {
    id = Number(id);

    const coiltype:Coiltype = await this.coiltypesBackendService.getCoiltype(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(coiltype);
    } else {
      this.elements[index] = coiltype;
    }

    return coiltype;
  }

  public async updateOrCreateElement(coiltype:Coiltype):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.coiltypesBackendService.updateCoiltype(coiltype);
  }

  public async postSelectedElement():Promise<Coiltype> {
    if (this.selectedElementCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:Coiltype = await this.coiltypesBackendService.addCoiltype(this.selectedElementCopy);

    this.elements.push(response);
    
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }

    await this.coiltypesBackendService.deleteCoiltype(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(coiltypeId: number) {
    // Not sure why I have to cast the coiltypeId to a number here, but it seems to be necessary.
    // Angular seems to pass the coiltypeId as a string, despite what the type definition says.
    const coiltypeIdNumber:number = Number(coiltypeId);
    this.selectedElementIsNew = false;

    await this.reloadElementWithId(coiltypeIdNumber);

    this.selectedElementCopy = this.getCopyElement(coiltypeIdNumber);
  }
}
