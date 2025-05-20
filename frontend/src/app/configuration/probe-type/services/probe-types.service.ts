import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { BackendService } from '../../../backend.service';
import { ProbeType } from '../interfaces/probe-type';

@Injectable({
  providedIn: 'root'
})
export class ProbeTypesService implements ListService<ProbeType> {
  public elements: ProbeType[] = [];
  public selectedElementCopy: ProbeType | null = null;
  public selectedElementIsNew: boolean = false;

  public isMeasurementSettingsSelector: boolean = false;
  public isProbeSelector: boolean = false;

  constructor(private backendService:BackendService) { }

  public get newElement(): ProbeType {
    return {
      id: 0,
      name: '',
      breite: null,
      hoehe: null,
      windungszahl: null,
      notiz: ''
    };
  }

  public getCopyElement(id:number):ProbeType {
    id = Number(id);

    const original:ProbeType|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Element with ID ${id} not found.`);
    }

    return {...original};
  }


  public async reloadElements():Promise<void> {
    this.elements = await this.backendService.getAllMeasurementProbeTypes();
  }

  public async reloadElementWithId(id:number):Promise<ProbeType> {
    id = Number(id);

    const element:ProbeType = await this.backendService.getMeasurementProbeType(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(element);
    } else {
      this.elements[index] = element;
    }

    return element;
  }

  public async updateOrCreateElement(element:ProbeType):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.backendService.updateMeasurementProbeType(element);
  }

  public async postSelectedElement():Promise<ProbeType> {
    if (this.selectedElementCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:ProbeType = await this.backendService.addMeasurementProbeType(this.selectedElementCopy);

    this.elements.push(response);

    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Element with ID ${id} not found.`);
    }

    await this.backendService.deleteMeasurementProbeType(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(id: number) {
    this.selectedElementIsNew = false;

    const elementIdNumber: number = Number(id);
    await this.reloadElementWithId(elementIdNumber);

    this.selectedElementCopy = this.getCopyElement(elementIdNumber);
  }
}
