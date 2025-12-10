import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Coil } from '../interfaces/coil';
import { CoiltypesBackendService } from '../../coiltype/services/coiltypes-backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoilsBackendService {

  constructor(private backendService:BackendService, private coilTypeBackendService: CoiltypesBackendService) { }

    public coilBackendToFrontend(coil: any): Coil {
        const newCoil: Coil = {
        id: coil.id,
        coiltype: this.coilTypeBackendService.coiltypeBackendToFrontend(coil.spuleTyp),
        coiltypeId: coil.spuletyp_id,
        einheit: coil.einheit ? coil.einheit.toString() : null,
        auftragsnummer: coil.auftragsnr,
        auftragsPosNr: coil.auftragsposnr,
        bemessungsfrequenz: coil.bemessungsfrequenz,
        bemessungsspannung: coil.bemessungsspannung,
        notiz: coil.notiz
        };

        return newCoil;
    }

    public coilFrontendToBackend(coil: Coil): any {
        return {
        id: coil.id,
        spuletyp_id: coil.coiltypeId,
        bemessungsfrequenz: coil.bemessungsfrequenz,
        bemessungsspannung: coil.bemessungsspannung,
        einheit: coil.einheit?.toString() ?? "",
        auftragsnr: coil.auftragsnummer,
        auftragsposnr: coil.auftragsPosNr,
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