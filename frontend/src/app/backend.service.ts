import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Coil } from './data/coil-data/coil';
import { Coiltype } from './data/coiltype-data/coiltype';
import { MeasurementSettings } from './data/measurement-settings/measurement-settings';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:5127/api/';

  constructor(private httpClient: HttpClient) { }

  // Endpoint is the path to the API endpoint (not starting with /), e.g. 'Spule'
  private httpGetRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.get(this.apiUrl + endpoint).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  private httpPostRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.post(this.apiUrl + endpoint, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json', 'charset': 'utf-8' }
      }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  private httpPutRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.put(this.apiUrl + endpoint, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json', 'charset': 'utf-8' }
      }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }  
  private httpDeleteRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.delete(this.apiUrl + endpoint).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private coilBackendToFrontend(coil: any): Coil {
    const newCoil: Coil = {
      id: coil.id,
      coiltype: coil.spuleTyp,
      coiltypeId: coil.spuleTypID,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
      notiz: coil.notiz
    };

    return newCoil;
  }
  
  private coilFrontendToBackend(coil: Coil): any {
    return {
      id: coil.id,
      spuleTypID: coil.coiltypeId,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
      notiz: coil.notiz
    };
  }
  
  private coiltypeBackendToFrontend(coiltype: any): Coiltype {
    return {
      id: coiltype.id,
      name: coiltype.name,
      schenkel: coiltype.schenkel,
      bandbreite: coiltype.bandbreite,
      schichthoehe: coiltype.schichthoehe,
      durchmesser: coiltype.durchmesser,
    };
  }

  private coiltypeFrontendToBackend(coiltype: Coiltype): any {
    return {
      spuleTypID: coiltype.id,
      name: coiltype.name,
      schenkel: coiltype.schenkel,
      bandbreite: coiltype.bandbreite,
      schichthoehe: coiltype.schichthoehe,
      durchmesser: coiltype.durchmesser,
    };
  }

  private measurementSettingsBackendToFrontend(measurementSettings: any): MeasurementSettings {
    return {
      coil: measurementSettings.spule,
      coilId: measurementSettings.spuleID,
      measurementProbeType: measurementSettings.messsondenTyp,
      measurementProbeTypeId: measurementSettings.messsondenTypID,
      wicklungszahl: measurementSettings.wicklungszahl,
      bemessungsspannung: measurementSettings.bemessungsspannung,
      bemessungsfrequenz: measurementSettings.bemessungsfrequenz,
      sondenProSchenkel: measurementSettings.sonden_pro_schenkel,
      notiz: measurementSettings.notiz
    };
  }

  private measurementSettingsFrontendToBackend(measurementSettings: MeasurementSettings): any{
    return {
      spuleID: measurementSettings.coilId,
      messsondenTypID: measurementSettings.measurementProbeTypeId,
      wicklungszahl: measurementSettings.wicklungszahl,
      bemessungsspannung: measurementSettings.bemessungsspannung,
      bemessungsfrequenz: measurementSettings.bemessungsfrequenz,
      sonden_pro_schenkel: measurementSettings.sondenProSchenkel,
      notiz: measurementSettings.notiz
    }
  }

  public async getAllCoils(): Promise<Coil[]> {
    const response:any = await this.httpGetRequest('Spule');
    return response.map((coil: any) => (this.coilBackendToFrontend(coil)));
  }

  public async getCoil(id: number): Promise<Coil> {
    const response:any = await this.httpGetRequest('Spule/' + id);
    return this.coilBackendToFrontend(response);
  }

  public async addCoil(coil: Coil): Promise<Coil> {
    const response:any = await this.httpPostRequest('Spule', this.coilFrontendToBackend(coil));
    return this.coilBackendToFrontend(response);
  }

  public async updateCoil(coil: Coil): Promise<void> {
    await this.httpPutRequest('Spule/' + coil.id, this.coilFrontendToBackend(coil));
  }

  public async deleteCoil(coil: Coil): Promise<void> {
    await this.httpDeleteRequest('Spule/' + coil.id);
  }

  public async getAllCoiltypes(): Promise<Coiltype[]> {
    const response:any = await this.httpGetRequest('SpuleTyp');
    return response.map((coiltype: any) => (this.coiltypeBackendToFrontend(coiltype)));
  }

  public async getCoiltype(id: number): Promise<Coiltype> {
    const response:any = await this.httpGetRequest('SpuleTyp/' + id);
    return this.coiltypeBackendToFrontend(response);
  }

  public async addCoiltype(coiltype: Coiltype): Promise<Coiltype> {
    const response:any = await this.httpPostRequest('SpuleTyp', this.coiltypeFrontendToBackend(coiltype));
    return this.coiltypeBackendToFrontend(response);
  }

  public async updateCoiltype(coiltype: Coiltype): Promise<void> {
    await this.httpPutRequest('SpuleTyp/' + coiltype.id, this.coiltypeFrontendToBackend(coiltype));
  }

  public async deleteCoiltype(coiltype: Coiltype): Promise<void> {
    await this.httpDeleteRequest('SpuleTyp/' + coiltype.id);
  }

  public async addMeasurementSettings(measurementSettings: MeasurementSettings): Promise<MeasurementSettings>{
    const response: any = await this.httpPostRequest('Messeinstellungen', this.measurementSettingsFrontendToBackend(measurementSettings));
    return this.measurementSettingsBackendToFrontend(response);
  }
}
