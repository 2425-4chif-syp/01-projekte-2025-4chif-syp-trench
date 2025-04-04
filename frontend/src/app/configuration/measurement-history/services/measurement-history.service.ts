import { Injectable } from '@angular/core';
import { ListService } from '../../../generic-list/services/list-service';
import { Measurement } from '../interfaces/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementHistoryService implements ListService<Measurement> {
  elements: Measurement[] = [];
  get newElement(): Measurement {
    throw new Error('Method not implemented.');
  }
  selectedElementCopy: Measurement | null = null;
  selectedElementIsNew: boolean = false;
  getCopyElement(id: number): Measurement {
    throw new Error('Method not implemented.');
  }

  reloadElements(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  reloadElementWithId(id: number): Promise<Measurement> {
    throw new Error('Method not implemented.');
  }

  updateOrCreateElement(element: Measurement): Promise<void> {
    throw new Error('Method not implemented.');
  }

  postSelectedElement(): Promise<Measurement> {
    throw new Error('Method not implemented.');
  }

  deleteElement(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  
  selectElement(id: number): void {
    throw new Error('Method not implemented.');
  }

}
