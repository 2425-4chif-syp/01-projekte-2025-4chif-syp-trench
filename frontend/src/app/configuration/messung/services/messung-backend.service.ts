import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Measurement } from '../../measurement-history/interfaces/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MessungBackendService {

  constructor(private backendService:BackendService) { }

  
    private messungBackendToFrontend(messung: any): Measurement {
        const newMessung: Measurement = {
        id: messung.id,
        messeinstellung: messung.messeinstellung,
        messeinstellungId: messung.messeinstellungId,
        anfangszeitpunkt: messung.anfangszeitpunkt,
        endzeitpunkt: messung.endzeitpunkt,
        name: messung.name,
        tauchkernstellung: messung.tauchkernstellung,
        pruefspannung: messung.pruefspannung,
        notiz: messung.notiz
        };

        return newMessung;
    }

    private messungFrontendToBackend(messung: Measurement): any {
        return {
            id: messung.id,
            messeinstellung: messung.messeinstellung,
            messeinstellungId: messung.messeinstellungId,
            anfangszeitpunkt: messung.anfangszeitpunkt,
            endzeitpunkt: messung.endzeitpunkt,
            name: messung.name,
            tauchkernstellung: messung.tauchkernstellung,
            pruefspannung: messung.pruefspannung,
            notiz: messung.notiz
        };
    }
  

    public async getAllMessungen(): Promise<Measurement[]> {
        const response:any = await this.backendService.httpGetRequest('Messung');
        return response.map((messung: any) => (this.messungBackendToFrontend(messung)));
    }

    public async getMessung(id: number): Promise<Measurement> {
        const response:any = await this.backendService.httpGetRequest('Messung/' + id);
        return this.messungBackendToFrontend(response);
    }

    public async addMessung(messung: Measurement): Promise<Measurement> {
        const response:any = await this.backendService.httpPostRequest('Messung', this.messungFrontendToBackend(messung));
        return this.messungBackendToFrontend(response);
    }

    public async updateMessung(messung: Measurement): Promise<void> {
        await this.backendService.httpPutRequest('Messung/' + messung.id, this.messungFrontendToBackend(messung));
    }

    public async deleteMessung(messung: Measurement): Promise<void> {
        await this.backendService.httpDeleteRequest('Messung/' + messung.id);
    }
}