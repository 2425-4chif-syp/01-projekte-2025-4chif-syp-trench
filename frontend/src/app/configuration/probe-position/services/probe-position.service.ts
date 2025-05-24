import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { ProbePosition } from '../interfaces/probe-position.model';
import { ProbePositionsBackendService } from './probe-positions-backend.service';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';

@Injectable({
  providedIn: 'root'
})
export class ProbePositionService implements ListService<ProbePosition> {
  public elements: ProbePosition[] = [];
  public selectedElementCopy: ProbePosition | null = null;
  public selectedElementIsNew: boolean = false;

  constructor(private probePositionBackendService: ProbePositionsBackendService) { }

  get newElement(): ProbePosition {
    return {
      id: 0,
      measurementSettingsId: 0,
      measurementSetting: null,
      measurementProbeId: null,
      measurementProbe: null,
      schenkel: 0,
      position: 0
    };
  }

  getCopyElement(id: number): ProbePosition {
    id = Number(id);
    const original = this.elements.find(c => c.id === id);
    if (!original) throw new Error(`Probe with ID ${id} not found.`);
    return { ...original };
  }

  public async reloadElements(): Promise<void> {
    this.elements = await this.probePositionBackendService.getAllProbePositions();
    console.log('pos', this.elements);
  }

  public async reloadElementWithId(id: number): Promise<ProbePosition> {
    const probe = await this.probePositionBackendService.getMeasurementProbePosition(id);
    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) this.elements.push(probe);
    else this.elements[index] = probe;
    return probe;
  }

  public async updateOrCreateElement(element: ProbePosition): Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
    } else {
      await this.probePositionBackendService.updateProbePosition(element);
    }
  }

  public async postSelectedElement(): Promise<ProbePosition> {
    if (!this.selectedElementCopy) throw new Error('No probe position selected.');
    const response = await this.probePositionBackendService.addProbePosition(this.selectedElementCopy);
    this.elements.push(response);
    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Probe position with ID ${id} not found.`);
    await this.probePositionBackendService.deleteProbePosition(this.elements[index]);
    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(id: number) {
    await this.reloadElementWithId(id);
    this.selectedElementCopy = this.getCopyElement(id);
    this.selectedElementIsNew = false;
  }

  public createEmptyPositions(schenkelzahl: number, sondenProSchenkel: number, einstellung: MeasurementSetting): void {
    const existingBySchenkel: { [schenkel: number]: ProbePosition[] } = {};
  
    for (const pos of this.elements) {
      if (!existingBySchenkel[pos.schenkel!]) {
        existingBySchenkel[pos.schenkel!] = [];
      }
      existingBySchenkel[pos.schenkel!].push(pos);
    }
  
    for (let schenkel = 1; schenkel <= schenkelzahl; schenkel++) {
      const existing = existingBySchenkel[schenkel] ?? [];
      const existingCount = existing.length;
  
      for (let posIndex = existingCount; posIndex < sondenProSchenkel; posIndex++) {
        const newPos: ProbePosition = {
          id: 0,
          measurementSettingsId: einstellung.id,
          measurementSetting: einstellung,
          measurementProbeId: null,
          measurementProbe: null,
          schenkel: schenkel,
          position: posIndex + 1
        };
        this.elements.push(newPos);
      }
    }
  }
  

  getGroupedProbePositions(): ProbePosition[][] {
    const grouped: { [key: number]: ProbePosition[] } = {};
  
    for (const pos of this.elements) {
      if (!grouped[pos.schenkel!]) {
        grouped[pos.schenkel!] = [];
      }
      grouped[pos.schenkel!].push(pos);
    }
  
    return Object.keys(grouped)
      .sort((a, b) => +a - +b)
      .map(key => grouped[+key]);
  }
  
}
