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
  public selectedElementIsNew = false;

  constructor(private backend: ProbePositionsBackendService) {}

  get newElement(): ProbePosition {
    return {
      id: null,                           
      measurementSettingsId: null,
      measurementSetting: null,
      measurementProbeId: null,
      measurementProbe: null,
      schenkel: null,
      position: null
    };
  }

  getCopyElement(id: number): ProbePosition {
    const original = this.elements.find(p => p.id === id);
    if (!original) throw new Error(`ProbePosition ${id} nicht gefunden`);
    return { ...original };
  }

  async reloadElements(): Promise<void> {
    this.elements = await this.backend.getAllProbePositions();
  }

  async reloadElementWithId(id: number): Promise<ProbePosition> {
    const p = await this.backend.getMeasurementProbePosition(id);
    const idx = this.elements.findIndex(e => e.id === id);
    if (idx === -1) this.elements.push(p);
    else             this.elements[idx] = p;
    return p;
  }

  async updateOrCreateElement(p: ProbePosition): Promise<void> {
    if (p.id == null) {                       
      this.selectedElementCopy = p;
      const saved = await this.postSelectedElement();
      const i = this.elements.indexOf(p);
      if (i !== -1) this.elements[i] = saved;
    } else {                                  
      await this.backend.updateProbePosition(p);
    }
  }

  async postSelectedElement(): Promise<ProbePosition> {
    if (!this.selectedElementCopy) throw new Error('Kein Element gewählt');
    const res = await this.backend.addProbePosition(this.selectedElementCopy);
    this.elements.push(res);
    return res;
  }


  async deleteElement(id: number): Promise<void> {
    const idx = this.elements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`ProbePosition ${id} nicht gefunden`);
    await this.backend.deleteProbePosition(this.elements[idx]);
    this.elements.splice(idx, 1);
    this.selectedElementCopy = null;
  }

  async selectElement(id: number): Promise<void> {
    await this.reloadElementWithId(id);
    this.selectedElementCopy = this.getCopyElement(id);
  }

  createEmptyPositions(
    schenkelzahl: number,
    sondenProSchenkel: number,
    einstellung: MeasurementSetting
  ): void {

    for (let schenkel = 1; schenkel <= schenkelzahl; schenkel++) {

      const vorhanden = this.elements
        .filter(p => p.schenkel === schenkel)
        .map(p => p.position);

      for (let posNr = 1; posNr <= sondenProSchenkel; posNr++) {
        if (vorhanden.includes(posNr)) continue;    

        this.elements.push({
          id:                    null,
          measurementSettingsId: einstellung.id,
          measurementSetting:    einstellung,
          measurementProbeId:    null,
          measurementProbe:      null,
          schenkel,
          position:              posNr
        });
      }
    }
  }

    getGroupedProbePositions(): ProbePosition[][] {
      const grouped: Record<number, ProbePosition[]> = {};
    
      for (const p of this.elements) {
        if (!grouped[p.schenkel!]) grouped[p.schenkel!] = [];
        grouped[p.schenkel!].push(p);
      }
    
      return Object.keys(grouped)
        .sort((a, b) => +a - +b)                
        .map(k =>
          grouped[+k].sort(
            (x, y) => (x.position ?? 0) - (y.position ?? 0)   
          )
        );
    }
  
}
