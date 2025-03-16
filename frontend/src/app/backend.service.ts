import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Coil } from './data/coil-data/coil';
import { Coiltype } from './data/coiltype-data/coiltype';
import { measurementSettings } from './data/measurement-settings/measurement-settings';
import { MeasurementProbe } from './data/measurement-probes/measurement-probes';

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
      id: coil.spuleID,
      coiltype: coil.spuleTyp,
      coiltypeId: coil.spuleTypID,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
    };

    //console.log('Coil:', newCoil);

    return newCoil;
  }
  
  private coilFrontendToBackend(coil: Coil): any {
    return {
      spuleID: coil.id,
      spuleTypID: coil.coiltypeId,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega
    };
  }
  
  private coiltypeBackendToFrontend(coiltype: any): Coiltype {
    return {
      id: coiltype.spuleTypID,
      tK_Name: coiltype.tK_Name,
      schenkel: coiltype.schenkel,
      bb: coiltype.bb,
      sh: coiltype.sh,
      dm: coiltype.dm,
    };
  }

  private coiltypeFrontendToBackend(coiltype: Coiltype): any {
    return {
      spuleTypID: coiltype.id,
      tK_Name: coiltype.tK_Name,
      schenkel: coiltype.schenkel,
      bb: coiltype.bb,
      sh: coiltype.sh,
      dm: coiltype.dm,
    };
  }

  private measurementSettingsBackendToFrontend(measurementSettings: any): measurementSettings {
    return {
      bemessungsSpannung: measurementSettings.bemessungsSpannung,
      bemessungsFrequenz: measurementSettings.bemessungsFrequenz,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      messStärke: measurementSettings.messStärke,
      zeitstempel: measurementSettings.zeitstempel
    };
  }

  private measurementSettingsFrontendToBackend(measurementSettings: measurementSettings): any{
    return {
      bemessungsSpannung: measurementSettings.bemessungsSpannung,
      bemessungsFrequenz: measurementSettings.bemessungsFrequenz,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      messStärke: measurementSettings.messStärke,
      zeitstempel: measurementSettings.zeitstempel
    }
  }

  private measurementProbeBackendToFrontend(measurementProbe: any): MeasurementProbe {
    return {
      id: measurementProbe.SensorID,
      width: measurementProbe.Durchmesser,
      yoke: measurementProbe.Schenkel,
      position: measurementProbe.Position
    }
  }

  private measurementProbeFrontendToBackend(measurementProbe: MeasurementProbe): any {
    return {
      SensorID: measurementProbe.id,
      Durchmesser: measurementProbe.width,
      Schenkel: measurementProbe.yoke,
      Position: measurementProbe.position
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

  public async addMeasurementSettings(measurementSettings: measurementSettings): Promise<measurementSettings>{
    const response: any = await this.httpPostRequest('Messeinstellungen', this.measurementSettingsFrontendToBackend(measurementSettings));
    return this.measurementSettingsBackendToFrontend(response);
  }
  
  public async getAllMeasurementProbes(): Promise<MeasurementProbe[]> {
    const response:any = await this.httpGetRequest('sensoren');
    return response.map((measurementProbe: any) => (this.measurementProbeBackendToFrontend(measurementProbe)));
  }

  public async getMeasurementProbe(id: number): Promise<MeasurementProbe> {
    const response:any = await this.httpGetRequest('sensoren/' + id);
    return this.measurementProbeBackendToFrontend(response);
  }
  
  public async addMeasurementProbe(measurementProbe: MeasurementProbe): Promise<MeasurementProbe> {
    const response:any = await this.httpPostRequest('sensoren', this.measurementProbeFrontendToBackend(measurementProbe));
    return this.measurementProbeBackendToFrontend(response);
  }

  public async updateMeasurementProbe(measurementProbe: MeasurementProbe): Promise<void> {
    await this.httpPutRequest('sensoren/' + measurementProbe.id, this.measurementProbeFrontendToBackend(measurementProbe));
  }

  public async deleteMeasurementProbe(measurementProbe: MeasurementProbe): Promise<void> {
    await this.httpDeleteRequest('sensoren/' + measurementProbe.id);
  }
}
