import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Probe } from '../interfaces/probe';
import { ProbesBackendService } from './probes-backend.service';
@Injectable({
  providedIn: 'root'
})
export class ProbesService implements ListService<Probe> {
  public elements: Probe[] = [];
  public selectedElementCopy:Probe|null = null;
  public selectedElementIsNew: boolean = false;

  public isProbeSelector:boolean = false;

  constructor(private probeBackendService:ProbesBackendService) {
  }
  public sortDirection: { [key: string]: boolean } = {};

  public get newElement(): Probe {
    return {
        id: 0,
        name: '',
        probeType: null,
        probeTypeId: 0,
        kalibrierungsfaktor: null,
    };
  }

  public getCopyElement(id:number):Probe {
    id = Number(id);

    const original:Probe|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Probe with ID ${id} not found.`);
    }

    return {...original};
  }

  public async reloadElements():Promise<void> {
    this.elements = await this.probeBackendService.getAllProbes();
  }

  public async reloadElementWithId(id:number):Promise<Probe> {
    id = Number(id);

    const probe:Probe = await this.probeBackendService.getProbe(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(probe);
    } else {
      this.elements[index] = probe;
    }

    return probe;
  }

  public async updateOrCreateElement(probe:Probe):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.probeBackendService.updateProbe(probe);
  }

  public async postSelectedElement():Promise<Probe> {
    if (this.selectedElementCopy === null) {
      throw new Error('No probe selected.');
    }

    const response:Probe = await this.probeBackendService.addProbe(this.selectedElementCopy);

    this.elements.push(response);
    
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Probe with ID ${id} not found.`);
    }

    await this.probeBackendService.deleteProbe(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(probeId: number) {
    const probeIdNumber:number = Number(probeId);
    this.selectedElementIsNew = false;

    await this.reloadElementWithId(probeIdNumber);

    this.selectedElementCopy = this.getCopyElement(probeIdNumber);
  }
}
