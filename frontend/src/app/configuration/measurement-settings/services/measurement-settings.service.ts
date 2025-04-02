import { Injectable } from '@angular/core';
import { ListService } from '../../list-service';
import { BackendService } from '../../../backend.service';
import { MeasurementSetting } from './measurement-settings';

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsService implements ListService<MeasurementSetting> {
  public elements: MeasurementSetting[] = [];
  public selectedElementCopy: MeasurementSetting | null = null;
  public selectedElementIsNew: boolean = false;

  constructor(private backendService: BackendService) {}

  public get newElement(): MeasurementSetting {
    return {
      coil: null,
      coilId: null,
      measurementProbeType: null,
      measurementProbeTypeId: null,
      wicklungszahl: null,
      bemessungsspannung: null,
      bemessungsfrequenz: null,
      sondenProSchenkel: null,
      notiz: null
    };
  }

  public getCopyElement(id: number): MeasurementSetting {
    const original = this.elements.find(e => e.coilId === id); // Falls du eine ID hast – hier ggf. anpassen
    if (!original) throw new Error(`MeasurementSetting with ID ${id} not found.`);
    return { ...original };
  }

  public async reloadElements(): Promise<void> {
    this.elements = await this.backendService.getAllMeasurementSettings();
  }

  public async reloadElementWithId(id: number): Promise<MeasurementSetting> {
    const element = await this.backendService.getMeasurementSettings(id);
    const index = this.elements.findIndex(e => e.coilId === id);
    if (index === -1) {
      this.elements.push(element);
    } else {
      this.elements[index] = element;
    }
    return element;
  }

  public async updateOrCreateElement(element: MeasurementSetting): Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
    } else {
      await this.backendService.updateMeasurementSettings(element);
    }
  }

  public async postSelectedElement(): Promise<MeasurementSetting> {
    if (!this.selectedElementCopy) throw new Error("No element selected.");
    const response = await this.backendService.addMeasurementSettings(this.selectedElementCopy);
    this.elements.push(response);
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    const index = this.elements.findIndex(e => e.coilId === id);
    if (index === -1) throw new Error(`Element with ID ${id} not found.`);
    await this.backendService.deleteMeasurementSettings(this.elements[index]);
    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(id: number): Promise<void> {
    this.selectedElementIsNew = false;
    await this.reloadElementWithId(id);
    this.selectedElementCopy = this.getCopyElement(id);
  }
}

