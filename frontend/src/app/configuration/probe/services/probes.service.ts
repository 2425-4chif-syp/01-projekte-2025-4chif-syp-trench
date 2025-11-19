import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Probe } from '../interfaces/probe';
import { ProbesBackendService } from './probes-backend.service';
import { ProbePositionService } from '../../probe-position/services/probe-position.service';
@Injectable({
  providedIn: 'root'
})
export class ProbesService implements ListService<Probe> {
  public elements: Probe[] = [];
  public selectedElementCopy:Probe|null = null;
  public selectedElementIsNew: boolean = false;

  public isProbeSelector:boolean = false;

  private readonly draftStorageKey = 'probe-draft';

  constructor(private probeBackendService:ProbesBackendService, private probePositionService:ProbePositionService) {
    this.reloadElements();
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

  async reloadElements(): Promise<void> {
  const allProbes = await this.probeBackendService.getAllProbes();

  if (this.isProbeSelector) {
    const currentSetting = this.probePositionService.selectedElementCopy?.measurementSetting;
    if (currentSetting && currentSetting.probeTypeId) {
      this.elements = allProbes.filter(
        probe => probe.probeTypeId === currentSetting.probeTypeId
      );
      return;
    }
    // If no measurement setting or no probeTypeId, show all probes
    // This prevents the list from being empty
  }

  this.elements = allProbes;
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

  returnSelectedProbe(probe: Probe): Probe {
    return probe;
  }

  public saveDraftToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.selectedElementCopy) {
        window.localStorage.removeItem(this.draftStorageKey);
        return;
      }

      const payload: Probe = { ...this.selectedElementCopy };
      window.localStorage.setItem(this.draftStorageKey, JSON.stringify(payload));
    } catch (err) {
      console.error('Fehler beim Speichern des Sonden-Entwurfs:', err);
    }
  }

  public loadDraftFromStorage(): Probe | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(this.draftStorageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Probe;
      this.selectedElementCopy  = parsed;
      this.selectedElementIsNew = !parsed.id || parsed.id === 0;
      return parsed;
    } catch (err) {
      console.error('Fehler beim Laden des Sonden-Entwurfs:', err);
      return null;
    }
  }

  public clearDraftFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(this.draftStorageKey);
    } catch (err) {
      console.error('Fehler beim Löschen des Sonden-Entwurfs:', err);
    }
  }
}
