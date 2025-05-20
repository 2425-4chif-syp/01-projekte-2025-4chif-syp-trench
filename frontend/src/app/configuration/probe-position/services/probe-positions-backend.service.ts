import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { ProbePosition } from '../interfaces/probe-position.model';

@Injectable({
  providedIn: 'root'
})
export class ProbePositionsBackendService {

  constructor(private backendService:BackendService) { }

  private probePositionBackendToFrontend(measurementProbePosition: any): ProbePosition {
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

  private probePositionFrontendToBackend(measurementProbePosition: ProbePosition): any {
    return {
      id: measurementProbePosition.id,
      messeinstellung_id: measurementProbePosition.measurementSettingsId,
      messsonde_id: measurementProbePosition.measurementProbeId,
      schenkel: measurementProbePosition.schenkel,
      position: measurementProbePosition.position
    }
  }
  
  public async getAllProbePositions(): Promise<ProbePosition[]> {
    const response: any = await this.backendService.httpGetRequest('MesssondenPosition');
    return response.map((pos: any) => this.probePositionBackendToFrontend(pos));
  }

  public async getMeasurementProbePosition(id: number): Promise<ProbePosition> {
    const response: any = await this.backendService.httpGetRequest('MesssondenPosition/' + id);
    return this.probePositionBackendToFrontend(response);
  }

  public async addProbePosition(pos: ProbePosition): Promise<ProbePosition> {
    const response: any = await this.backendService.httpPostRequest('MesssondenPosition', this.probePositionFrontendToBackend(pos));
    return this.probePositionBackendToFrontend(response);
  }

  public async updateProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService.httpPutRequest('MesssondenPosition/' + pos.id, this.probePositionFrontendToBackend(pos));
  }

  public async deleteProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService.httpDeleteRequest('MesssondenPosition/' + pos.id);
  }
}
