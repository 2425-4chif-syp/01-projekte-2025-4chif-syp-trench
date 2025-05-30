import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Measurement } from '../interfaces/measurement.model';
import { MeasurementSettingsBackendService } from '../../measurement-settings/services/measurement-settings-backend.service';
import { MeasurementsBackendService } from './measurement-backend.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementHistoryService implements ListService<Measurement> {
  public selectedElementIsNew: boolean = false;
  public elements: Measurement[] = [];
  public selectedElementCopy: Measurement | null = null;

  public get newElement(): Measurement {
    return {
      id: null,
      measurementSettings: null,
      measurementSettingsId: null,
      anfangszeitpunkt: null,
      endzeitpunkt: null,
      name: '',
      tauchkernstellung: null,
      pruefspannung: null,
      notiz: null,
    }
  }

  constructor(private measurementBackendService: MeasurementsBackendService, private measurementSettingsBackendService: MeasurementSettingsBackendService) {}
  
  public getCopyElement(id: number): Measurement {
    id = Number(id);

    const original:Measurement|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Measurement with ID ${id} not found.`);
    }
    console.log(`Copying element with ID ${id}:`, original);
    return {...original};
  }

  public async reloadElements(): Promise<void> {
    this.elements = await this.measurementBackendService.getAllMeasurements();
    if (this.selectedElementCopy?.measurementSettingsId != null) {
      this.selectedElementCopy!.measurementSettings = await this.measurementSettingsBackendService.getMeasurementSettings(this.selectedElementCopy?.measurementSettingsId);
    }
  }

  public async reloadElementWithId(id: number): Promise<Measurement> {
    id = Number(id);
    
    const measurement: Measurement = await this.measurementBackendService.getMeasurement(id);
    const index: number = this.elements.findIndex((element: Measurement) => element.id === id);
    if (index === -1) {
      this.elements.push(measurement);
    }
    else {
      this.elements[index] = measurement;
    }

    return measurement;
  }

  public async updateOrCreateElement(measurement: Measurement): Promise<void> {
    if (this.selectedElementIsNew){
      this.selectedElementCopy = measurement;
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.measurementBackendService.updateMeasurement(measurement);
  }

  public async postSelectedElement(): Promise<Measurement> {
    if (!this.selectedElementCopy) throw new Error("No element selected.");
    const response = await this.measurementBackendService.addMeasurement(this.selectedElementCopy);
    this.elements.push(response);
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    const index = this.elements.findIndex(e => e.id === id);
    if (index === -1) throw new Error(`Element with ID ${id} not found.`);
    await this.measurementBackendService.deleteMeasurement(this.elements[index]);
    this.elements.splice(index, 1);
    this.selectedElementCopy = null;  }
  
  selectElement(id: number): void {
    throw new Error('Method not implemented.');
  }

}
