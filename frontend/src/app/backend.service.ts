import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Coil } from './configuration/coil/interfaces/coil';
import { Coiltype } from './configuration/coiltype/interfaces/coiltype';
import { MeasurementProbeType } from './configuration/measurement-probe-type/interfaces/measurement-probe-type';
import { MeasurementSetting } from './configuration/measurement-settings/interfaces/measurement-settings';

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
      notiz: coiltype.notiz
    };
  }

  private coiltypeFrontendToBackend(coiltype: Coiltype): any {
    return {
      id: coiltype.id,
      name: coiltype.name,
      schenkel: coiltype.schenkel,
      bandbreite: coiltype.bandbreite,
      schichthoehe: coiltype.schichthoehe,
      durchmesser: coiltype.durchmesser,
      notiz: coiltype.notiz
    };
  }

  private measurementProbeTypeBackendToFrontend(measurementProbeType: any): MeasurementProbeType {
    return {
      id: measurementProbeType.id,
      breite: measurementProbeType.breite,
      hoehe: measurementProbeType.hoehe,
      wicklungszahl: measurementProbeType.wicklungszahl,
      notiz: measurementProbeType.notiz
    };
  }
  private measurementProbeTypeFrontendToBackend(measurementProbeType: MeasurementProbeType): any {
    return {
      id: measurementProbeType.id,
      breite: measurementProbeType.breite,
      hoehe: measurementProbeType.hoehe,
      wicklungszahl: measurementProbeType.wicklungszahl,
      notiz: measurementProbeType.notiz
    };
  }

  private measurementSettingsBackendToFrontend(measurementSettings: any): MeasurementSetting {
    return {
      id: measurementSettings.id,
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

  private measurementSettingsFrontendToBackend(measurementSettings: MeasurementSetting): any{
    return {
      id: measurementSettings.id,
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

  public async getAllMeasurementProbeTypes(): Promise<MeasurementProbeType[]> {
    const response:any = await this.httpGetRequest('MesssondenTyp');
    return response.map((measurementProbeType: any) => (this.measurementProbeTypeBackendToFrontend(measurementProbeType)));
  }
  public async getMeasurementProbeType(id: number): Promise<MeasurementProbeType> {
    const response:any = await this.httpGetRequest('MesssondenTyp/' + id);
    return this.measurementProbeTypeBackendToFrontend(response);
  }
  public async addMeasurementProbeType(measurementProbeType:MeasurementProbeType): Promise<MeasurementProbeType> {
    const response:any = await this.httpPostRequest('MesssondenTyp', this.measurementProbeTypeBackendToFrontend(measurementProbeType));
    return this.measurementProbeTypeBackendToFrontend(response);
  }

  public async updateMeasurementProbeType(measurementProbeType: MeasurementProbeType): Promise<void> {
    await this.httpPutRequest('MesssondenTyp/' + measurementProbeType.id, this.measurementProbeTypeFrontendToBackend(measurementProbeType));
  }

  public async deleteMeasurementProbeType(measurementProbeType: MeasurementProbeType): Promise<void> {
    await this.httpDeleteRequest('MesssondenTyp/' + measurementProbeType.id);
  }


  public async addMeasurementSettings(measurementSettings: MeasurementSetting): Promise<MeasurementSetting>{
    const response: any = await this.httpPostRequest('Messeinstellung', this.measurementSettingsFrontendToBackend(measurementSettings));
    return this.measurementSettingsBackendToFrontend(response);
  }

  public async getAllMeasurementSettings(): Promise<MeasurementSetting[]>{
    const response: any = await this.httpGetRequest('Messeinstellung');
    return response.map((measurementSettings: any) => (this.measurementSettingsBackendToFrontend(measurementSettings)));
  }

  public async getMeasurementSettings(id: number): Promise<MeasurementSetting>{
    const response: any = await this.httpGetRequest('Messeinstellung/' + id);
    return this.measurementSettingsBackendToFrontend(response);
  }

  public async updateMeasurementSettings(measurementSettings: MeasurementSetting): Promise<void>{
    await this.httpPutRequest('Messeinstellung/' + measurementSettings.coilId, this.measurementSettingsFrontendToBackend(measurementSettings));
  }

  public async deleteMeasurementSettings(measurementSettings: MeasurementSetting): Promise<void>{
    await this.httpDeleteRequest('Messeinstellung/' + measurementSettings.coilId);
  }
}
