import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { ProbePosition } from '../interfaces/probe-position.model';
import { MeasurementSettingsBackendService } from '../../measurement-settings/services/measurement-settings-backend.service';

@Injectable({
  providedIn: 'root'
})
export class ProbePositionsBackendService {

  constructor(private backendService:BackendService, private measurementSettingsBackendService: MeasurementSettingsBackendService) { }

  private probePositionBackendToFrontend(measurementProbePosition: any): ProbePosition {
    return {
      id: measurementProbePosition.id,
      measurementSettingsId: measurementProbePosition.messeinstellungID,
      measurementSetting: this.measurementSettingsBackendService.measurementSettingsBackendToFrontend(measurementProbePosition.messeinstellung),
      measurementProbeId: measurementProbePosition.sondeID,
      measurementProbe: measurementProbePosition.sonde,
      schenkel: measurementProbePosition.schenkel,
      position: measurementProbePosition.position
    }
  }

  private probePositionFrontendToBackend(measurementProbePosition: ProbePosition): any {
    return {
      id: measurementProbePosition.id,
      messeinstellungID: measurementProbePosition.measurementSettingsId,
      sondeID: measurementProbePosition.measurementProbeId,
      schenkel: measurementProbePosition.schenkel,
      position: measurementProbePosition.position
    }
  }
  
  public async getAllProbePositions(): Promise<ProbePosition[]> {
    const response: any = await this.backendService.httpGetRequest('SondenPosition');
    return response.map((pos: any) => this.probePositionBackendToFrontend(pos));
  }
  public async getMeasurementProbePosition(id: number): Promise<ProbePosition> {
    const response: any = await this.backendService.httpGetRequest('SondenPosition/' + id);
    return this.probePositionBackendToFrontend(response);
  }

  public async addProbePosition(pos: ProbePosition): Promise<ProbePosition> {
    const response: any = await this.backendService.httpPostRequest('SondenPosition', this.probePositionFrontendToBackend(pos));
    return this.probePositionBackendToFrontend(response);
  }

  public async updateProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService.httpPutRequest('SondenPosition/' + pos.id, this.probePositionFrontendToBackend(pos));
  }

  public async deleteProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService.httpDeleteRequest('SondenPosition/' + pos.id);
  }
}
