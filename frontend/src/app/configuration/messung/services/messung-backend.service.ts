import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Messung } from '../interfaces/messung';

@Injectable({
  providedIn: 'root'
})
export class MessungBackendService {

  constructor(private backendService:BackendService) { }

  
    private messungBackendToFrontend(messung: any): Messung {
        const newMessung: Messung = {
        id: messung.id,
        messeinstellung: messung.messeinstellung,
        messeinstellungId: messung.messeinstellung_id,
        anfangszeitpunkt: messung.anfangszeitpunkt,
        endzeitpunkt: messung.endzeitpunkt,
        name: messung.name,
        tauchkernstellung: messung.tauchkernstellung,
        pruefspannung: messung.pruefspannung,
        notiz: messung.notiz
        };

        return newMessung;
    }

    private messungFrontendToBackend(messung: Messung): any {
        return {
            id: messung.id,
            messeinstellung: messung.messeinstellung,
            messeinstellung_id: messung.messeinstellungId,
            anfangszeitpunkt: messung.anfangszeitpunkt,
            endzeitpunkt: messung.endzeitpunkt,
            name: messung.name,
            tauchkernstellung: messung.tauchkernstellung,
            pruefspannung: messung.pruefspannung,
            notiz: messung.notiz
        };
    }
  

    public async getAllMessungen(): Promise<Messung[]> {
        const response:any = await this.backendService.httpGetRequest('Messung');
        return response.map((messung: any) => (this.messungBackendToFrontend(messung)));
    }

    public async getMessung(id: number): Promise<Messung> {
        const response:any = await this.backendService.httpGetRequest('Messung/' + id);
        return this.messungBackendToFrontend(response);
    }

    public async addMessung(messung: Messung): Promise<Messung> {
        const response:any = await this.backendService.httpPostRequest('Messung', this.messungFrontendToBackend(messung));
        return this.messungBackendToFrontend(response);
    }

    public async updateMessung(messung: Messung): Promise<void> {
        await this.backendService.httpPutRequest('Messung/' + messung.id, this.messungFrontendToBackend(messung));
    }

    public async deleteMessung(messung: Messung): Promise<void> {
        await this.backendService.httpDeleteRequest('Messung/' + messung.id);
    }
}