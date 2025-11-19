import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Measurement } from '../interfaces/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementsBackendService {

  constructor(private backendService:BackendService) { }


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

  public async getAllMeasurements(): Promise<Measurement[]> {
    const response: any = await this.backendService.httpGetRequest('Messung');
    return response.map((measurement: any) => (this.measurementBackendToFrontend(measurement)));
  }

  public async getMeasurement(id: number): Promise<Measurement> {
    const response: any = await this.backendService.httpGetRequest('Messung/' + id);
    return this.measurementBackendToFrontend(response);
  }

  public async addMeasurement(measurement: Measurement): Promise<Measurement> {
    const response: any = await this.backendService.httpPostRequest('Messung', this.measurementFrontendToBackend(measurement));
    return this.measurementBackendToFrontend(response);
  }

  public async updateMeasurement(measurement: Measurement): Promise<void> {
    await this.backendService.httpPutRequest('Messung/' + measurement.id, this.measurementFrontendToBackend(measurement));
  }

  public async deleteMeasurement(measurement: Measurement): Promise<void> {
    await this.backendService.httpDeleteRequest('Messung/' + measurement.id);
  }

  public async saveMeasurement(measurementData: any): Promise<any> {
    return this.backendService.httpPostRequest('Messung/Complete', measurementData);
  }

  public async startMeasuring(measurementSettingId: number, note: string): Promise<number> {
    const response: any = await this.backendService.httpPostRequest('Messung/startMeasuring', {
      MesseinstellungID: measurementSettingId,
      Notiz: note
    });
    return response;
  }

  public async stopMeasuring(): Promise<void> {
    await this.backendService.httpPostRequest('Messung/stopMeasuring', {});
  }

  public async addLiveMesswert(sondenPositionId: number, wert: number): Promise<void> {
    await this.backendService.httpPostRequest('Messung/AddLiveMesswert', {
      sondenPositionID: sondenPositionId,
      wert: wert
    });
  }

  public async getCurrentMessungValues(): Promise<any[]> {
    return this.backendService.httpGetRequest('Messung/Current/Values');
  }
}
