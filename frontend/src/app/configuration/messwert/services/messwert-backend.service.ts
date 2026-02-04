import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Messwert } from '../interfaces/messwert.model';

@Injectable({
  providedIn: 'root'
})
export class MesswertBackendService {

  constructor(private backendService:BackendService) { }

  private messwertBackendToFrontend(messwert: any): Messwert {
    // Backend returns Schenkel and Position as flat fields from the optimized query
    // Build sondenPosition object from these fields if they exist
    const sondenPosition = (messwert.schenkel !== undefined || messwert.position !== undefined) 
      ? {
          id: messwert.sondenPositionID,
          schenkel: messwert.schenkel ?? 0,
          position: messwert.position ?? 0,
          messeinstellungID: null,
          messeinstellung: null
        }
      : messwert.sondenPosition;

    return {
      id: messwert.id,
      messungID: messwert.messungID,
      measurement: messwert.messung,
      sondenPositionID: messwert.sondenPositionID,
      sondenPosition: sondenPosition,
      wert: messwert.wert,
      zeitpunkt: messwert.zeitpunkt
    }
  }

  private messwertFrontendToBackend(messwert: Messwert): any {
    return {
      id: messwert.id,
      messungID: messwert.messungID,
      sondenPositionID: messwert.sondenPositionID,
      wert: messwert.wert,
      zeitpunkt: messwert.zeitpunkt
    }
  }

  public async getAllMesswerte(): Promise<Messwert[]> {
    const response: any = await this.backendService.httpGetRequest('Messwert');
    return response.map((wert: any) => this.messwertBackendToFrontend(wert));
  }

  public async getMesswerteByMessungId(messungId: number): Promise<Messwert[]> {
    const response: any = await this.backendService.httpGetRequest(`Messwert/messung/${messungId}`);
    if (!Array.isArray(response)) {
      return [];
    }
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
