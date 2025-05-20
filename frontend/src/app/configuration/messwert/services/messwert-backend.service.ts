import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Messwert } from '../interfaces/messwert.model';

@Injectable({
  providedIn: 'root'
})
export class MesswertBackendService {

  constructor(private backendService:BackendService) { }

  private messwertBackendToFrontend(messwert: any): Messwert {
    return {
      id: messwert.id,
      measurement_id: messwert.messung_id,
      measurement: messwert.messung,
      measurementProbePositionId: messwert.messsondenPosition_id,
      measurementProbePosition: messwert.messsondenPosition,
      wert: messwert.wert,
      zeitpunkt: messwert.zeitpunkt
    }
  }

  private messwertFrontendToBackend(messwert: Messwert): any {
    return {
      id: messwert.id,
      messung_id: messwert.measurement_id,
      messsondenPosition_id: messwert.measurementProbePositionId,
      wert: messwert.wert,
      zeitpunkt: messwert.zeitpunkt
    }
  }

  public async getAllMesswerte(): Promise<Messwert[]> {
    const response: any = await this.backendService.httpGetRequest('Messwert');
    return response.map((wert: any) => this.messwertBackendToFrontend(wert));
  }
  
  public async getMesswert(id: number): Promise<Messwert> {
    const response: any = await this.backendService.httpGetRequest('Messwert/' + id);
    return this.messwertBackendToFrontend(response);
  }
  
  public async addMesswert(wert: Messwert): Promise<Messwert> {
    const response: any = await this.backendService.httpPostRequest('Messwert', this.messwertFrontendToBackend(wert));
    return this.messwertBackendToFrontend(response);
  }

  public async updateMesswert(wert: Messwert): Promise<void> {
    await this.backendService.httpPutRequest('Messwert/' + wert.id, this.messwertFrontendToBackend(wert));
  }
  
  public async deleteMesswert(wert: Messwert): Promise<void> {
    await this.backendService.httpDeleteRequest('Messwert/' + wert.id);
  }
}
