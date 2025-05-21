import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { MeasurementSetting } from '../interfaces/measurement-settings';

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsBackendService {

  constructor(private backendService:BackendService) { }

  private measurementSettingsBackendToFrontend(measurementSettings: any): MeasurementSetting {
    
    const coil = measurementSettings.spule ? {
      id: measurementSettings.spule.id,
      coiltype: measurementSettings.spule.spuleTyp ? {
        id: measurementSettings.spule.spuleTyp.id,
        name: measurementSettings.spule.spuleTyp.name,
        schenkel: measurementSettings.spule.spuleTyp.schenkelzahl,
        bandbreite: measurementSettings.spule.spuleTyp.bandbreite,
        schichthoehe: measurementSettings.spule.spuleTyp.schichthoehe,
        durchmesser: measurementSettings.spule.spuleTyp.durchmesser,
        toleranzbereich: measurementSettings.spule.spuleTyp.toleranzbereich,
        notiz: measurementSettings.spule.spuleTyp.notiz
      } : null,
      coiltypeId: measurementSettings.spule.spuleTypID,
      einheit: measurementSettings.spule.einheit,
      auftragsnummer: measurementSettings.spule.auftragsnr,
      auftragsPosNr: measurementSettings.spule.auftragsPosNr,
      bemessungsfrequenz: measurementSettings.spule.bemessungsfrequenz,
      bemessungsspannung: measurementSettings.spule.bemessungsspannung,
      notiz: measurementSettings.spule.notiz
    } : null;

    const result = {
      id: measurementSettings.id,
      coil: coil,
      coilId: measurementSettings.spuleID,
      measurementProbeType: measurementSettings.sondenTyp,
      measurementProbeTypeId: measurementSettings.sondenTypID,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      name: measurementSettings.name,
      probeType: measurementSettings.sondenTyp,
      probeTypeId: measurementSettings.sondenTypID
    };

    return result;
  }

  private measurementSettingsFrontendToBackend(measurementSettings: MeasurementSetting): any{
    return {
      id: measurementSettings.id,
      spuleID: measurementSettings.coilId,
      sondenTypID: measurementSettings.probeTypeId,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      name: measurementSettings.name
    }
  }

  public async addMeasurementSettings(measurementSettings: MeasurementSetting): Promise<MeasurementSetting>{
    const response: any = await this.backendService.httpPostRequest('Messeinstellung', this.measurementSettingsFrontendToBackend(measurementSettings));
    return this.measurementSettingsBackendToFrontend(response);
  }

  public async getAllMeasurementSettings(): Promise<MeasurementSetting[]>{
    const response: any = await this.backendService.httpGetRequest('Messeinstellung');
    return response.map((measurementSettings: any) => (this.measurementSettingsBackendToFrontend(measurementSettings)));
  }

  public async getMeasurementSettings(id: number): Promise<MeasurementSetting>{
    const response: any = await this.backendService.httpGetRequest('Messeinstellung/' + id);
    return this.measurementSettingsBackendToFrontend(response);
  }

  public async updateMeasurementSettings(measurementSettings: MeasurementSetting): Promise<void>{
    await this.backendService.httpPutRequest('Messeinstellung/' + measurementSettings.id, this.measurementSettingsFrontendToBackend(measurementSettings));
  }

  public async deleteMeasurementSettings(measurementSettings: MeasurementSetting): Promise<void>{
    await this.backendService.httpDeleteRequest('Messeinstellung/' + measurementSettings.id);
  }

}
