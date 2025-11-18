import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Coil } from '../interfaces/coil';
import { CoilsBackendService } from './coils-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoilsService implements ListService<Coil> {
  public elements: Coil[] = [];
  public selectedElementCopy: Coil|null = null;
  public selectedElementIsNew: boolean = false;
  
  public isCoilSelector: boolean = false;

  constructor(private coilsBackendService:CoilsBackendService) { }

  public get newElement(): Coil {
    return {
      id: 0,
      coiltype: null,
      coiltypeId: null,
      einheit: '',
      auftragsnummer: '',
      auftragsPosNr: '',
      bemessungsspannung: null,
      bemessungsfrequenz: null,
      notiz: ''
    };
  }

  public getCopyElement(id:number):Coil {
    id = Number(id);

    const original:Coil|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coil with ID ${id} not found.`);
    }
    
    return {...original};
  }
  

  public async reloadElements():Promise<void> {
    this.elements = await this.coilsBackendService.getAllCoils();
  }
  
  public async reloadElementWithId(id:number):Promise<Coil> {
    id = Number(id);

    const coil:Coil = await this.coilsBackendService.getCoil(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(coil);
    } else {
      this.elements[index] = coil;
    }

    return coil;  
  }
  
  public async updateOrCreateElement(coil:Coil):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.coilsBackendService.updateCoil(coil);
  }  

  public async postSelectedElement():Promise<Coil> {
    if (this.selectedElementCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:Coil = await this.coilsBackendService.addCoil(this.selectedElementCopy);

    this.elements.push(response);

    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coil with ID ${id} not found.`);
    }

    await this.coilsBackendService.deleteCoil(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(coilId: number) {
    this.selectedElementIsNew = false;

    const coilIdNumber: number = Number(coilId);
    console.log('Lade Spule mit ID:', coilIdNumber);
    await this.reloadElementWithId(coilIdNumber);
  
    this.selectedElementCopy = this.getCopyElement(coilIdNumber);
    console.log('selectedCoilCopy nach Laden:', this.selectedElementCopy);
  }
  
}
