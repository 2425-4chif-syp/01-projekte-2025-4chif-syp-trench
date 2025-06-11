import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { ProbePosition } from '../interfaces/probe-position.model';
import { ProbePositionsBackendService } from './probe-positions-backend.service';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';

@Injectable({
  providedIn: 'root'
})
export class ProbePositionService implements ListService<ProbePosition> {

  public elements: ProbePosition[] = [];
  public selectedElementCopy: ProbePosition | null = null;
  public selectedElementIsNew               = false;
  public groupedProbePositions: ProbePosition[][]  = [];

  constructor(private backend: ProbePositionsBackendService, private measurementSettingsService: MeasurementSettingsService) {}

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
    try{
      this.elements = await this.backend.getPositionsForMeasurementSettings(this.measurementSettingsService.selectedElementCopy?.id!); 

    } 
    catch(e){
      this.elements = [];
    }
    this.loadGroupedProbePositions();                 
  }

  async reloadElementWithId(id: number): Promise<ProbePosition> {
    const p   = await this.backend.getMeasurementProbePosition(id);
    const idx = this.elements.findIndex(e => e.id === id);

    if (idx === -1) this.elements.push(p);
    else             this.elements[idx] = p;

    this.loadGroupedProbePositions();                
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

      const idx = this.elements.findIndex(e => e.id === p.id);
      if (idx !== -1) this.elements[idx] = { ...p };  
    }

    this.loadGroupedProbePositions();               
  }

  async postSelectedElement(): Promise<ProbePosition> {
    if (!this.selectedElementCopy) throw new Error('Kein Element gewählt');

    const res = await this.backend.addProbePosition(this.selectedElementCopy);
    this.elements.push(res);
    this.loadGroupedProbePositions();                
    return res;
  }

  async deleteElement(id: number): Promise<void> {
    const idx = this.elements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`ProbePosition ${id} nicht gefunden`);

    await this.backend.deleteProbePosition(this.elements[idx]);

    this.elements.splice(idx, 1);
    this.selectedElementCopy = null;

    this.loadGroupedProbePositions();              
  }

  async selectElement(id: number): Promise<void> {
    await this.reloadElementWithId(id);
    this.selectedElementCopy = this.getCopyElement(id);
  }

  async createEmptyPositions(
    schenkelzahl: number,
    sondenProSchenkel: number,
    einstellung: MeasurementSetting
  ): Promise<void> {
    console.log('setting:', einstellung);

    if (this.elements.length > 0) {
      this.loadGroupedProbePositions();
      return;
    }

    const toSave: ProbePosition[] = [];

    for (let schenkel = 1; schenkel <= schenkelzahl; schenkel++) {
      for (let posNr = 1; posNr <= sondenProSchenkel; posNr++) {
        toSave.push({
          id: null,
          measurementSettingsId: einstellung.id,
          measurementSetting: einstellung,
          measurementProbeId: null,
          measurementProbe: null,
          schenkel,
          position: posNr,
        });
      }
    }

    const saved = await Promise.all(
      toSave.map((p) => this.backend.addProbePosition(p))
    );
    
    //this.elements.push(...saved);

    saved.forEach((p) => { p.measurementSetting = einstellung; });
    this.elements = saved;

    this.loadGroupedProbePositions();
  }

  private getGroupedProbePositions(): ProbePosition[][] {
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

  public loadGroupedProbePositions(): void {
    this.groupedProbePositions = this.getGroupedProbePositions();
  }

  async getProbePositionsByMeasurementSettings(id: number){
    try{
      this.elements = await this.backend.getPositionsForMeasurementSettings(id);
    }
    catch(e){

    }
  }
}
