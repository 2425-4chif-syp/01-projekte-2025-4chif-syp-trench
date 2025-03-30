import { Injectable } from '@angular/core';
import { NonNullAssert } from '@angular/compiler';
import { BackendService } from '../../backend.service';
import { ListService } from '../list-service';
import { MeasurementProbeType } from './measurement-probe-type';

@Injectable({
  providedIn: 'root'
})
export class MeasurementProbeTypesService implements ListService<MeasurementProbeType> {
  public elements: MeasurementProbeType[] = [];
  public selectedElementCopy: MeasurementProbeType|null = null;
  public selectedElementIsNew: boolean = false;

  constructor(private backendService:BackendService) { }

  public get newElement(): MeasurementProbeType {
    return {
      id: 0,
      breite: null,
      hoehe: null,
      wicklungszahl: null,
      notiz: null
    };
  }

  public getCopyElement(id:number):MeasurementProbeType {
    id = Number(id);

    const original:MeasurementProbeType|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coil with ID ${id} not found.`);
    }
    
    return {...original};
  }
  

  public async reloadElements():Promise<void> {
    this.elements = await this.backendService.getAllMeasurementProbeTypes();
  }
  
  public async reloadElementWithId(id:number):Promise<MeasurementProbeType> {
    id = Number(id);

    const element:MeasurementProbeType = await this.backendService.getMeasurementProbeType(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(element);
    } else {
      this.elements[index] = element;
    }

    return element;  
  }
  
  public async updateOrCreateElement(element:MeasurementProbeType):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.backendService.updateMeasurementProbeType(element);
  }  

  public async postSelectedElement():Promise<MeasurementProbeType> {
    if (this.selectedElementCopy === null) {
      throw new Error('No coil selected.');
    }

    const response:MeasurementProbeType = await this.backendService.addMeasurementProbeType(this.selectedElementCopy);

    this.elements.push(response);

    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Coil with ID ${id} not found.`);
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
