import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Messung } from '../interfaces/messung';
import { MessungBackendService } from './messung-backend.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessungService implements ListService<Messung> {
  public elements: Messung[] = [];
  public selectedElementCopy: Messung|null = null;
  public selectedElementIsNew: boolean = false;
  public clickedMessung: Messung | null = null;
  
  public isMessungSelector: boolean = false;

  // Properties für die laufende Messung
  private isMeasuringSubject = new BehaviorSubject<boolean>(false);
  public isMeasuring$ = this.isMeasuringSubject.asObservable();
  
  private currentMeasurementData: { [key: string]: number[] } = {};
  private measurementStartTime: Date | null = null;
  private currentMeasurementSettingId: number | null = null;
  private currentYokeData: { x: number; y: number }[][] = [];
  private currentMTot: number = 0;

  private readonly draftStorageKey = 'messung-draft';

  constructor(private messungBackendService:MessungBackendService) { }

  // Methoden für die laufende Messung
  public startGlobalMeasurement(measurementSettingId: number): void {
    this.isMeasuringSubject.next(true);
    this.measurementStartTime = new Date();
    this.currentMeasurementSettingId = measurementSettingId;
    this.currentMeasurementData = {};
    this.currentYokeData = [];
    this.currentMTot = 0;
  }

  public stopGlobalMeasurement(): void {
    this.isMeasuringSubject.next(false);
    this.measurementStartTime = null;
    this.currentMeasurementSettingId = null;
    this.currentMeasurementData = {};
    this.currentYokeData = [];
    this.currentMTot = 0;
  }

  public isCurrentlyMeasuring(): boolean {
    return this.isMeasuringSubject.value;
  }

  public getCurrentMeasurementData(): { [key: string]: number[] } {
    return this.currentMeasurementData;
  }

  public getMeasurementStartTime(): Date | null {
    return this.measurementStartTime;
  }

  public getCurrentMeasurementSettingId(): number | null {
    return this.currentMeasurementSettingId;
  }

  public addMeasurementData(key: string, value: number): void {
    if (!this.currentMeasurementData[key]) {
      this.currentMeasurementData[key] = [];
    }
    this.currentMeasurementData[key].push(value);
  }

  public updateYokeData(yokeData: { x: number; y: number }[][]): void {
    this.currentYokeData = yokeData;
  }

  public getCurrentYokeData(): { x: number; y: number }[][] {
    return this.currentYokeData;
  }

  public updateMTot(mTot: number): void {
    this.currentMTot = mTot;
  }

  public getCurrentMTot(): number {
    return this.currentMTot;
  }

  public get newElement(): Messung {
    return {
      id: 0,
      messeinstellung: null,
      messeinstellungId: null,
      anfangszeitpunkt: null,
      endzeitpunkt: null,
      name: '',
      tauchkernstellung: null,
      pruefspannung: null,
      notiz: '',
    };
  }

  public getCopyElement(id:number):Messung {
    id = Number(id);

    const original:Messung|undefined = this.elements.find(c => c.id === id);
    if (original === undefined) {
      throw new Error(`Messung with ID ${id} not found.`);
    }
    
    return {...original};
  }
  

  public async reloadElements():Promise<void> {
    this.elements = await this.messungBackendService.getAllMessungen();
  }
  
  public async reloadElementWithId(id:number):Promise<Messung> {
    id = Number(id);

    const messung:Messung = await this.messungBackendService.getMessung(id);
    const index:number = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      this.elements.push(messung);
    } else {
      this.elements[index] = messung;
    }

    return messung;  
  }
  
  public async updateOrCreateElement(messung:Messung):Promise<void> {
    if (this.selectedElementIsNew) {
      this.selectedElementCopy = await this.postSelectedElement();
      this.selectedElementIsNew = false;
      return;
    }

    await this.messungBackendService.updateMessung(messung);
  }  

  public async postSelectedElement():Promise<Messung> {
    if (this.selectedElementCopy === null) {
      throw new Error('No Messung selected.');
    }

    const response:Messung = await this.messungBackendService.addMessung(this.selectedElementCopy);

    this.elements.push(response);

    return response;
  }

  public async deleteElement(id: number): Promise<void> {
    id = Number(id);

    const index = this.elements.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Messung with ID ${id} not found.`);
    }

    await this.messungBackendService.deleteMessung(this.elements[index]);

    this.elements.splice(index, 1);
    this.selectedElementCopy = null;
  }

  public async selectElement(messungId: number) {
    this.selectedElementIsNew = false;

    const messungIdNumber: number = Number(messungId);
    console.log('Lade Messung mit ID:', messungIdNumber);
    await this.reloadElementWithId(messungIdNumber);
  
    this.selectedElementCopy = this.getCopyElement(messungIdNumber);
    console.log('selectedMessungCopy nach Laden:', this.selectedElementCopy);
  }
  
  public async loadCurrentMeasurement(): Promise<void> {
    try {
      // Lade alle Messungen
      await this.reloadElements();
      
      // Finde die aktive Messung (ohne endzeitpunkt)
      const activeMeasurement = this.elements.find(m => m.endzeitpunkt === null);
      
      if (activeMeasurement) {
        // Lade die vollständigen Messungsdaten
        const currentMeasurement = await this.messungBackendService.getMessung(activeMeasurement.id!);
        
        // Setze die Messungsdaten
        this.currentMeasurementSettingId = currentMeasurement.messeinstellungId;
        this.measurementStartTime = currentMeasurement.anfangszeitpunkt;
        
        // Setze den Messungsstatus
        this.isMeasuringSubject.next(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden der aktuellen Messung:', error);
      this.isMeasuringSubject.next(false);
    }
  }

  public saveDraftToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.selectedElementCopy) {
        window.localStorage.removeItem(this.draftStorageKey);
        return;
      }

      const payload: Messung = { ...this.selectedElementCopy };
      window.localStorage.setItem(this.draftStorageKey, JSON.stringify(payload));
    } catch (err) {
      console.error('Fehler beim Speichern des Messungs-Entwurfs:', err);
    }
  }

  public loadDraftFromStorage(): Messung | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(this.draftStorageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Messung;
      this.selectedElementCopy  = parsed;
      this.selectedElementIsNew = !parsed.id || parsed.id === 0;
      return parsed;
    } catch (err) {
      console.error('Fehler beim Laden des Messungs-Entwurfs:', err);
      return null;
    }
  }

  public clearDraftFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(this.draftStorageKey);
    } catch (err) {
      console.error('Fehler beim Löschen des Messungs-Entwurfs:', err);
    }
  }
}
