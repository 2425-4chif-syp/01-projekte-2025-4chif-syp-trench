import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { MeasurementSetting } from '../interfaces/measurement-settings';
import { CoilsBackendService } from '../../coil/services/coils-backend.service';
import { CoiltypesBackendService } from '../../coiltype/services/coiltypes-backend.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsBackendService {

  constructor(
    private backendService: BackendService,
    private coilBackendService: CoilsBackendService,
    private coilTypeBackendService: CoiltypesBackendService
  ) { }

  public measurementSettingsBackendToFrontend(ms: any): MeasurementSetting {
    if (!ms){
      console.log(ms);
      throw new Error('Backend lieferte keine Messeinstellung-Daten ');
    }

    return {
      id:                 ms.id,
      coil:               this.coilBackendService.coilBackendToFrontend(ms.spule),
      coilId:             ms.spule_id,
      sondenProSchenkel:  ms.sonden_pro_schenkel,
      name:               ms.name,
      probeType:          ms.sondenTyp,
      probeTypeId:        ms.sondentyp_id
    };
  }

  public measurementSettingsFrontendToBackend(ms: MeasurementSetting): any {
    return {
      id:                 ms.id,
      spule_id:           Number(ms.coilId),                 
      sondentyp_id:       Number(ms.probeTypeId),            
      sonden_pro_schenkel: Number(ms.sondenProSchenkel),      
      name:               ms.name
    };
  }

  public async addMeasurementSettings(ms: MeasurementSetting): Promise<MeasurementSetting> {
    const res: any = await this.backendService.httpPostRequest(
      'Messeinstellung',
      this.measurementSettingsFrontendToBackend(ms)
    );
    return this.measurementSettingsBackendToFrontend(res);
  }

  public async getAllMeasurementSettings(): Promise<MeasurementSetting[]> {
    const res: any = await this.backendService.httpGetRequest('Messeinstellung');
    return res.map((ms: any) => this.measurementSettingsBackendToFrontend(ms));
  }

  public async getMeasurementSettings(id: number): Promise<MeasurementSetting> {
    const res: any = await this.backendService.httpGetRequest(`Messeinstellung/${id}`);
    return this.measurementSettingsBackendToFrontend(res);
  }

  public async updateMeasurementSettings(ms: MeasurementSetting): Promise<void> {
    await this.backendService.httpPutRequest(
      `Messeinstellung/${ms.id}`,
      this.measurementSettingsFrontendToBackend(ms)
    );
  }

  public async deleteMeasurementSettings(ms: MeasurementSetting): Promise<void> {
    await this.backendService.httpDeleteRequest(`Messeinstellung/${ms.id}`);
  }
}
