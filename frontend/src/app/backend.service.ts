import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Coil } from './configuration/coil/interfaces/coil';
import { Coiltype } from './configuration/coiltype/interfaces/coiltype';
import { MeasurementProbeType } from './configuration/measurement-probe-type/interfaces/measurement-probe-type';
import { MeasurementSetting } from './configuration/measurement-settings/interfaces/measurement-settings';
import { Measurement } from './configuration/measurement-history/interfaces/measurement.model';
import { MeasurementProbe } from './configuration/measurement-probe/interfaces/measurement-probes';
import { MeasurementProbePosition } from './configuration/measurement-probe-position/interfaces/measurement-probe-position.model';
import { Messwert } from './configuration/messwert/interfaces/messwert.model';

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
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnr,
      auftragsPosNr: coil.auftragsPosNr,
      bemessungsfrequenz: coil.bemessungsfrequenz,
      bemessungsspannung: coil.bemessungsspannung,
      notiz: coil.notiz
    };

    return newCoil;
  }

  private coilFrontendToBackend(coil: Coil): any {
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

  private measurementProbeTypeBackendToFrontend(measurementProbeType: any): MeasurementProbeType {
    return {
      id: measurementProbeType.id,
      name: measurementProbeType.name,
      breite: measurementProbeType.breite,
      hoehe: measurementProbeType.hoehe,
      windungszahl: measurementProbeType.windungszahl,
      notiz: measurementProbeType.notiz
    };
  }
  private measurementProbeTypeFrontendToBackend(measurementProbeType: MeasurementProbeType): any {
    return {
      id: measurementProbeType.id,
      name: measurementProbeType.name,
      breite: measurementProbeType.breite,
      hoehe: measurementProbeType.hoehe,
      windungszahl: measurementProbeType.windungszahl,
      notiz: measurementProbeType.notiz
    };
  }

  private measurementSettingsBackendToFrontend(measurementSettings: any): MeasurementSetting {
    return {
      id: measurementSettings.id,
      coil: measurementSettings.spule,
      coilId: measurementSettings.spuleID,
      measurementProbeType: measurementSettings.sondenTyp,
      measurementProbeTypeId: measurementSettings.sondenTypID,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      name: measurementSettings.name
    };
  }

  private measurementSettingsFrontendToBackend(measurementSettings: MeasurementSetting): any{
    return {
      id: measurementSettings.id,
      spuleID: measurementSettings.coilId,
      sondenTypID: measurementSettings.measurementProbeTypeId,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      name: measurementSettings.name
    }
  }

  private measurementBackendToFrontend(measurement: any): Measurement {
    return {
      id: measurement.id,
      measurementSettings: measurement.messeinstellung,
      measurementSettingsId: measurement.messeinstellungID,
      anfangszeitpunkt: measurement.anfangszeitpunkt,
      endzeitpunkt: measurement.endzeitpunkt,
      name: measurement.name,
      tauchkernstellung: measurement.tauchkernstellung,
      pruefspannung: measurement.pruefspannung,
      notiz: measurement.notiz
    }
  }

  private measurementFrontendToBackend(measurement: Measurement): any {
    return {
      id: measurement.id,
      messeinstellungID: measurement.measurementSettingsId,
      anfangszeitpunkt: measurement.anfangszeitpunkt,
      endzeitpunkt: measurement.endzeitpunkt,
      name: measurement.name,
      tauchkernstellung: measurement.tauchkernstellung,
      pruefspannung: measurement.pruefspannung,
      notiz: measurement.notiz
    }
  }

  private measurementProbeBackendToFrontend(measurementProbe: any): MeasurementProbe {
    return {
      id: measurementProbe.id,
      probeType: measurementProbe.probeTyp,
      probeTypeId: measurementProbe.probeTypID,
      name: measurementProbe.name,
      kalibrierungsfaktor: measurementProbe.kalibrierungsfaktor,
    }
  }

  private measurementProbeFrontendToBackend(measurementProbe: MeasurementProbe): any {
    return {
      id: measurementProbe.id,
      probeTypId: measurementProbe.probeTypeId,
      name: measurementProbe.name,
      kalibrierungsfaktor: measurementProbe.kalibrierungsfaktor,
    }
  }
    
  private measurementProbePositionBackendToFrontend(measurementProbePosition: any): MeasurementProbePosition {
    return {
      id: measurementProbePosition.id,
      measurementSettingsId: measurementProbePosition.messeinstellung_id,
      measurementSetting: measurementProbePosition.messeinstellung,
      measurementProbeId: measurementProbePosition.messsonde_id,
      measurementProbe: measurementProbePosition.messsonde,
      schenkel: measurementProbePosition.schenkel,
      position: measurementProbePosition.position
    }
  }

  private measurementProbePositionFrontendToBackend(measurementProbePosition: MeasurementProbePosition): any {
    return {
      id: measurementProbePosition.id,
      messeinstellung_id: measurementProbePosition.measurementSettingsId,
      messsonde_id: measurementProbePosition.measurementProbeId,
      schenkel: measurementProbePosition.schenkel,
      position: measurementProbePosition.position
    }
  }

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

  // Spulen

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

  // Spulentypen

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

  // Messsondentyp

  public async getAllMeasurementProbeTypes(): Promise<MeasurementProbeType[]> {
    const response:any = await this.httpGetRequest('SondenTyp');
    return response.map((measurementProbeType: any) => (this.measurementProbeTypeBackendToFrontend(measurementProbeType)));
  }
  public async getMeasurementProbeType(id: number): Promise<MeasurementProbeType> {
    const response:any = await this.httpGetRequest('SondenTyp/' + id);
    return this.measurementProbeTypeBackendToFrontend(response);
  }
  public async addMeasurementProbeType(measurementProbeType:MeasurementProbeType): Promise<MeasurementProbeType> {
    const response:any = await this.httpPostRequest('SondenTyp', this.measurementProbeTypeBackendToFrontend(measurementProbeType));
    return this.measurementProbeTypeBackendToFrontend(response);
  }

  public async updateMeasurementProbeType(measurementProbeType: MeasurementProbeType): Promise<void> {
    await this.httpPutRequest('SondenTyp/' + measurementProbeType.id, this.measurementProbeTypeFrontendToBackend(measurementProbeType));
  }

  public async deleteMeasurementProbeType(measurementProbeType: MeasurementProbeType): Promise<void> {
    await this.httpDeleteRequest('SondenTyp/' + measurementProbeType.id);
  }

  // Messsonden
  public async getAllMeasurementProbes(): Promise<MeasurementProbe[]> {
    const response: any = await this.httpGetRequest('Messsonde');
    return response.map((probe: any) => this.measurementProbeBackendToFrontend(probe));
  }
  
  public async getMeasurementProbe(id: number): Promise<MeasurementProbe> {
    const response: any = await this.httpGetRequest('Messsonde/' + id);
    return this.measurementProbeBackendToFrontend(response);
  }
  
  public async addMeasurementProbe(probe: MeasurementProbe): Promise<MeasurementProbe> {
    const response: any = await this.httpPostRequest('Messsonde', this.measurementProbeFrontendToBackend(probe));
    return this.measurementProbeBackendToFrontend(response);
  }
  
  public async updateMeasurementProbe(probe: MeasurementProbe): Promise<void> {
    await this.httpPutRequest('Messsonde/' + probe.id, this.measurementProbeFrontendToBackend(probe));
  }
  
  public async deleteMeasurementProbe(probe: MeasurementProbe): Promise<void> {
    await this.httpDeleteRequest('Messsonde/' + probe.id);
  }
  
  // Messeinstellungen

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
    await this.httpPutRequest('Messeinstellung/' + measurementSettings.id, this.measurementSettingsFrontendToBackend(measurementSettings));
  }

  public async deleteMeasurementSettings(measurementSettings: MeasurementSetting): Promise<void>{
    await this.httpDeleteRequest('Messeinstellung/' + measurementSettings.id);
  }

  //Messsondenpositionen
  public async getAllMeasurementProbePositions(): Promise<MeasurementProbePosition[]> {
    const response: any = await this.httpGetRequest('MesssondenPosition');
    return response.map((pos: any) => this.measurementProbePositionBackendToFrontend(pos));
  }
  
  public async getMeasurementProbePosition(id: number): Promise<MeasurementProbePosition> {
    const response: any = await this.httpGetRequest('MesssondenPosition/' + id);
    return this.measurementProbePositionBackendToFrontend(response);
  }
  
  public async addMeasurementProbePosition(pos: MeasurementProbePosition): Promise<MeasurementProbePosition> {
    const response: any = await this.httpPostRequest('MesssondenPosition', this.measurementProbePositionFrontendToBackend(pos));
    return this.measurementProbePositionBackendToFrontend(response);
  }
  
  public async updateMeasurementProbePosition(pos: MeasurementProbePosition): Promise<void> {
    await this.httpPutRequest('MesssondenPosition/' + pos.id, this.measurementProbePositionFrontendToBackend(pos));
  }
  
  public async deleteMeasurementProbePosition(pos: MeasurementProbePosition): Promise<void> {
    await this.httpDeleteRequest('MesssondenPosition/' + pos.id);
  }
  
  // Messwerte

  public async getAllMesswerte(): Promise<Messwert[]> {
    const response: any = await this.httpGetRequest('Messwert');
    return response.map((wert: any) => this.messwertBackendToFrontend(wert));
  }
  
  public async getMesswert(id: number): Promise<Messwert> {
    const response: any = await this.httpGetRequest('Messwert/' + id);
    return this.messwertBackendToFrontend(response);
  }
  
  public async addMesswert(wert: Messwert): Promise<Messwert> {
    const response: any = await this.httpPostRequest('Messwert', this.messwertFrontendToBackend(wert));
    return this.messwertBackendToFrontend(response);
  }
  
  public async updateMesswert(wert: Messwert): Promise<void> {
    await this.httpPutRequest('Messwert/' + wert.id, this.messwertFrontendToBackend(wert));
  }
  
  public async deleteMesswert(wert: Messwert): Promise<void> {
    await this.httpDeleteRequest('Messwert/' + wert.id);
  }
  
  // Messungen

  public async getAllMeasurements(): Promise<Measurement[]> {
    const response: any = await this.httpGetRequest('Messung');
    return response.map((measurement: any) => (this.measurementBackendToFrontend(measurement)));
  }

  public async getMeasurement(id: number): Promise<Measurement> {
    const response: any = await this.httpGetRequest('Messung/' + id);
    return this.measurementBackendToFrontend(response);
  }

  public async addMeasurement(measurement: Measurement): Promise<Measurement> {
    const response: any = await this.httpPostRequest('Messung', this.measurementFrontendToBackend(measurement));
    return this.measurementBackendToFrontend(response);
  }

  public async updateMeasurement(measurement: Measurement): Promise<void> {
    await this.httpPutRequest('Messung/' + measurement.id, this.measurementFrontendToBackend(measurement));
  }

  public async deleteMeasurement(measurement: Measurement): Promise<void> {
    await this.httpDeleteRequest('Messung/' + measurement.id);
  }

  // Neue Methode zum Speichern einer Messung
  public async saveMeasurement(measurementData: any): Promise<any> {
    return this.httpPostRequest('Messung/Complete', measurementData);
  }
}