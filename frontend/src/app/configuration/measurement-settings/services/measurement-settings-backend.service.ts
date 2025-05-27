import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { MeasurementSetting } from '../interfaces/measurement-settings';
import { Coil } from '../../coil/interfaces/coil';
import { Coiltype } from '../../coiltype/interfaces/coiltype';
import { CoilsBackendService } from '../../coil/services/coils-backend.service';
import { CoiltypesBackendService } from '../../coiltype/services/coiltypes-backend.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsBackendService {

  constructor(private backendService: BackendService, private coilBackendService: CoilsBackendService, private coilTypeBackendService: CoiltypesBackendService) { }

  public measurementSettingsBackendToFrontend(measurementSettings: any): MeasurementSetting {
    console.log("MAPPED Coiltype:", this.coilBackendService.coilBackendToFrontend(measurementSettings.spule).coiltype);
    const tmp: MeasurementSetting = {
      id: measurementSettings.id,
      coil: this.coilBackendService.coilBackendToFrontend(measurementSettings.spule),
      coilId: measurementSettings.spuleID,
      probeType: measurementSettings.sondenTyp,
      probeTypeId: measurementSettings.sondenTypID,
      sondenProSchenkel: measurementSettings.sondenProSchenkel,
      name: measurementSettings.name
    };

    console.log("MAPPED MeasurementSettings:", tmp);

    return tmp;
  }

  public measurementSettingsFrontendToBackend(measurementSettings: MeasurementSetting): any{
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
