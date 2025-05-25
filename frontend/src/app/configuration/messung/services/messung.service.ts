import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Messung } from '../interfaces/messung';
import { MessungBackendService } from './messung-backend.service';

@Injectable({
  providedIn: 'root'
})
export class MessungService implements ListService<Messung> {
  public elements: Messung[] = [];
  public selectedElementCopy: Messung|null = null;
  public selectedElementIsNew: boolean = false;
  
  public isMessungSelector: boolean = false;

  constructor(private messungBackendService:MessungBackendService) { }

  public get newElement(): Messung {
    return {
      id: 0,
      messeinstellung: null,
      messeinstellungId: null,
      anfangszeitpunkt: null,
      endzeitpunkt: null,
      name: '',
      tauchkernstellung: null,
      pruefspannung: null,
      notiz: '',
    };
  }

  public getCopyElement(id:number):Messung {
    id = Number(id);

    const original:Messung|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Messung with ID ${id} not found.`);
    }
    
    return {...original};
  }
  

  public async reloadElements():Promise<void> {
    this.elements = await this.messungBackendService.getAllMessungen();
  }
  
  public async reloadElementWithId(id:number):Promise<Messung> {
    id = Number(id);

    const messung:Messung = await this.messungBackendService.getMessung(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(messung);
    } else {
      this.elements[index] = messung;
    }

    return messung;  
  }
  
  public async updateOrCreateElement(messung:Messung):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.messungBackendService.updateMessung(messung);
  }  

  public async postSelectedElement():Promise<Messung> {
    if (this.selectedElementCopy === null) {
      throw new Error('No Messung selected.');
    }

    const response:Messung = await this.messungBackendService.addMessung(this.selectedElementCopy);

    this.elements.push(response);

    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Messung with ID ${id} not found.`);
    }

    await this.messungBackendService.deleteMessung(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(messungId: number) {
    this.selectedElementIsNew = false;

    const messungIdNumber: number = Number(messungId);
    console.log('Lade Messung mit ID:', messungIdNumber);
    await this.reloadElementWithId(messungIdNumber);
  
    this.selectedElementCopy = this.getCopyElement(messungIdNumber);
    console.log('selectedMessungCopy nach Laden:', this.selectedElementCopy);
  }
  
}
