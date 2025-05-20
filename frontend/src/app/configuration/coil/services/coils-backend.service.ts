import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Coil } from '../interfaces/coil';

@Injectable({
  providedIn: 'root'
})
export class CoilsBackendService {

  constructor(private backendService:BackendService) { }

    public coilBackendToFrontend(coil: any): Coil {
        const newCoil: Coil = {
        id: coil.id,
        coiltype: coil.spuleTyp,
        coiltypeId: coil.spuleTypID,
        einheit: coil.einheit,
        auftragsnummer: coil.auftragsnr,
        auftragsPosNr: coil.auftragsPosNr,
        bemessungsfrequenz: coil.bemessungsfrequenz,
        bemessungsspannung: coil.bemessungsspannung,
        notiz: coil.notiz
        };

        return newCoil;
    }

    public coilFrontendToBackend(coil: Coil): any {
        return {
        id: coil.id,
        spuleTypID: coil.coiltypeId,
        bemessungsfrequenz: coil.bemessungsfrequenz,
        bemessungsspannung: coil.bemessungsspannung,
        einheit: coil.einheit,
        auftragsnr: coil.auftragsnummer,
        auftragsPosNr: coil.auftragsPosNr,
        notiz: coil.notiz
        };
    }
  

    public async getAllCoils(): Promise<Coil[]> {
        const response:any = await this.backendService.httpGetRequest('Spule');
        return response.map((coil: any) => (this.coilBackendToFrontend(coil)));
    }

    public async getCoil(id: number): Promise<Coil> {
        const response:any = await this.backendService.httpGetRequest('Spule/' + id);
        return this.coilBackendToFrontend(response);
    }

    public async addCoil(coil: Coil): Promise<Coil> {
        const response:any = await this.backendService.httpPostRequest('Spule', this.coilFrontendToBackend(coil));
        return this.coilBackendToFrontend(response);
    }

    public async updateCoil(coil: Coil): Promise<void> {
        await this.backendService.httpPutRequest('Spule/' + coil.id, this.coilFrontendToBackend(coil));
    }

    public async deleteCoil(coil: Coil): Promise<void> {
        await this.backendService.httpDeleteRequest('Spule/' + coil.id);
    }
}