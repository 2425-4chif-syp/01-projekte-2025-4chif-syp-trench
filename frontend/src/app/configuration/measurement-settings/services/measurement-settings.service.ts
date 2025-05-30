import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { MeasurementSetting } from '../interfaces/measurement-settings';
import { MeasurementSettingsBackendService } from './measurement-settings-backend.service';
import { CoilsBackendService } from '../../coil/services/coils-backend.service';
import { ProbeTypesBackendService } from '../../probe-type/services/probe-types-backend.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsService implements ListService<MeasurementSetting> {
  public elements: MeasurementSetting[] = [];
  public selectedElementCopy: MeasurementSetting | null = null;
  public selectedElementIsNew: boolean = false;
  public isCoilSelector: boolean = false;

  constructor(private measurementSettingsBackendService: MeasurementSettingsBackendService, private coilBackendService: CoilsBackendService, private probeTypeBackendService: ProbeTypesBackendService) {}

  public get newElement(): MeasurementSetting {
    return {
      id: null,
      name: "",
      coilId: null,
      probeTypeId: null,
      coil: null,
      probeType: null,
      sondenProSchenkel: 1,
    };
  }

  public getCopyElement(id: number): MeasurementSetting {
    id = Number(id);

    const original:MeasurementSetting|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Coiltype with ID ${id} not found.`);
    }

    console.log(`Copying element with ID ${id}:`, original);

    return {...original};
  }

  public async reloadElements(): Promise<void> {
    this.elements = await this.measurementSettingsBackendService.getAllMeasurementSettings();

    console.log('Reload elements');

    if (this.selectedElementCopy?.coilId! != null && this.selectedElementCopy?.probeType! != null) {
      this.selectedElementCopy!.coil = await this.coilBackendService.getCoil(this.selectedElementCopy?.coilId!);
      this.selectedElementCopy!.probeType = await this.probeTypeBackendService.getProbeType(this.selectedElementCopy?.probeTypeId!);
    }
  }

  public async reloadElementWithId(id: number): Promise<MeasurementSetting> {
    id = Number(id);

    const setting: MeasurementSetting = await this.measurementSettingsBackendService.getMeasurementSettings(id);
    const index: number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(setting);
    } else {
      this.elements[index] = setting;
    }

    return setting;
  }

  public async updateOrCreateElement(measurementSetting: MeasurementSetting):Promise<void> {
    console.log(this.selectedElementIsNew)
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = measurementSetting;
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.measurementSettingsBackendService.updateMeasurementSettings(measurementSetting);
  }


  public async postSelectedElement(): Promise<MeasurementSetting> {
    if (!this.selectedElementCopy) throw new Error("No element selected.");
    const response = await this.measurementSettingsBackendService.addMeasurementSettings(this.selectedElementCopy);
    this.elements.push(response);
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    const index = this.elements.findIndex(e => e.coilId === id);
    if (index === -1) throw new Error(`Element with ID ${id} not found.`);
    await this.measurementSettingsBackendService.deleteMeasurementSettings(this.elements[index]);
    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(id: number): Promise<void> {
    this.selectedElementIsNew = false;

    const measurementIdNumber: number = Number(id);
    console.log('Lade Messeinstellung mit der ID:', measurementIdNumber);
    await this.reloadElementWithId(measurementIdNumber);

    this.selectedElementCopy = this.getCopyElement(measurementIdNumber);

    if (this.selectedElementCopy?.coilId != null) {
      this.selectedElementCopy.coil = await this.coilBackendService.getCoil(this.selectedElementCopy?.coilId);
    }

    if (this.selectedElementCopy?.probeTypeId != null) {
      this.selectedElementCopy.probeType = await this.probeTypeBackendService.getProbeType(this.selectedElementCopy.probeTypeId);
    }
  }
}

