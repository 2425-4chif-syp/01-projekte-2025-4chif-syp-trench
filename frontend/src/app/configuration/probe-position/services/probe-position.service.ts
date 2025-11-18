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

  // ------------------------------------------------------------
  // LADEN & SPEICHERN
  // ------------------------------------------------------------

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

      // Reload the updated element from backend to get full object with relationships
      const updated = await this.backend.getMeasurementProbePosition(p.id);
      const idx = this.elements.findIndex(e => e.id === p.id);
      if (idx !== -1) this.elements[idx] = updated;  
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

    // Get current positions from backend, handle 404 for new measurement settings
    let current: ProbePosition[] = [];
    try {
      current = await this.backend.getPositionsForMeasurementSettings(einstellung.id!);
    } catch (error: any) {
      // If 404, this is a new measurement setting with no positions yet
      if (error?.status === 404) {
        console.log('No existing positions found, creating new ones');
        current = [];
      } else {
        throw error;
      }
    }

    const desiredKeys = new Set<string>();
    for (let schenkel = 1; schenkel <= schenkelzahl; schenkel++) {
      for (let pos = 1; pos <= sondenProSchenkel; pos++) {
        desiredKeys.add(`${schenkel}:${pos}`);
      }
    }

    const currentMap = new Map<string, ProbePosition>();
    for (const p of current) {
      currentMap.set(`${p.schenkel}:${p.position}`, p);
    }

    // Find positions to delete (those that exist in backend but not in desired set)
    const toDelete = current.filter(p => !desiredKeys.has(`${p.schenkel}:${p.position}`));
    await Promise.all(toDelete.map(del => this.backend.deleteProbePosition(del)));

    // Find positions to add (those in desired set but not in backend)
    const toAdd: ProbePosition[] = [];
    const toUpdate: ProbePosition[] = [];
    
    for (const key of desiredKeys) {
      const existingInBackend = currentMap.get(key);
      
      if (!existingInBackend) {
        // Check if we have a local version with a probe assignment
        const localVersion = this.elements.find(
          p => p.schenkel === Number(key.split(':')[0]) && 
               p.position === Number(key.split(':')[1])
        );
        
        const [s, pos] = key.split(':').map(x => Number(x));
        toAdd.push({
          id: null,
          measurementSettingsId: einstellung.id,
          measurementSetting: einstellung,
          measurementProbeId: localVersion?.measurementProbeId ?? null,
          measurementProbe: localVersion?.measurementProbe ?? null,
          schenkel: s,
          position: pos
        });
      } else {
        // Check if local version has different probe assignment
        const localVersion = this.elements.find(
          p => p.schenkel === existingInBackend.schenkel && 
               p.position === existingInBackend.position
        );
        
        if (localVersion && localVersion.measurementProbeId !== existingInBackend.measurementProbeId) {
          toUpdate.push({
            ...existingInBackend,
            measurementProbeId: localVersion.measurementProbeId,
            measurementProbe: localVersion.measurementProbe
          });
        }
      }
    }

    // Add new positions
    const added = await Promise.all(toAdd.map(p => this.backend.addProbePosition(p)));
    added.forEach(p => p.measurementSetting = einstellung);

    // Update existing positions with new probe assignments
    await Promise.all(toUpdate.map(p => this.backend.updateProbePosition(p)));

    this.elements = await this.backend.getPositionsForMeasurementSettings(einstellung.id!);
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
