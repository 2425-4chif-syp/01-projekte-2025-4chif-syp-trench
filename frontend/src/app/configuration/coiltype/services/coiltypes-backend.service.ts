import { Injectable } from '@angular/core';
import { Coiltype } from '../interfaces/coiltype';
import { BackendService } from '../../../backend.service';

@Injectable({
  providedIn: 'root'
})
export class CoiltypesBackendService {

  constructor(private backendService:BackendService) { }


  private coiltypeBackendToFrontend(coiltype: any): Coiltype {
    return {
      id: coiltype.id,
      name: coiltype.name,
      schenkel: coiltype.schenkelzahl,
      bandbreite: coiltype.bandbreite,
      schichthoehe: coiltype.schichthoehe,
      durchmesser: coiltype.durchmesser,
      toleranzbereich: coiltype.toleranzbereich,
      notiz: coiltype.notiz
    };
  }

  private coiltypeFrontendToBackend(coiltype: Coiltype): any {
    return {
      id: coiltype.id,
      name: coiltype.name,
      schenkelzahl: coiltype.schenkel,
      bandbreite: coiltype.bandbreite,
      schichthoehe: coiltype.schichthoehe,
      durchmesser: coiltype.durchmesser,
      toleranzbereich: coiltype.toleranzbereich,
      notiz: coiltype.notiz
    };
  }


  public async getAllCoiltypes(): Promise<Coiltype[]> {
    const response:any = await this.backendService.httpGetRequest('SpuleTyp');
    return response.map((coiltype: any) => (this.coiltypeBackendToFrontend(coiltype)));
  }

  public async getCoiltype(id: number): Promise<Coiltype> {
    const response:any = await this.backendService.httpGetRequest('SpuleTyp/' + id);
    return this.coiltypeBackendToFrontend(response);
  }

  public async addCoiltype(coiltype: Coiltype): Promise<Coiltype> {
    const response:any = await this.backendService.httpPostRequest('SpuleTyp', this.coiltypeFrontendToBackend(coiltype));
    return this.coiltypeBackendToFrontend(response);
  }

  public async updateCoiltype(coiltype: Coiltype): Promise<void> {
    await this.backendService.httpPutRequest('SpuleTyp/' + coiltype.id, this.coiltypeFrontendToBackend(coiltype));
  }

  public async deleteCoiltype(coiltype: Coiltype): Promise<void> {
    await this.backendService.httpDeleteRequest('SpuleTyp/' + coiltype.id);
  }
}
