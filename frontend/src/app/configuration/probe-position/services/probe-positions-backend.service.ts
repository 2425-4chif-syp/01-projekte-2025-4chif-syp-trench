import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { ProbePosition } from '../interfaces/probe-position.model';
import { MeasurementSettingsBackendService } from '../../measurement-settings/services/measurement-settings-backend.service';

@Injectable({
  providedIn: 'root'
})
export class ProbePositionsBackendService {

  constructor(
    private backendService: BackendService,
    private measurementSettingsBackendService: MeasurementSettingsBackendService
  ) {}

  private probePositionBackendToFrontend(mp: any): ProbePosition {
    console.log('ProbePositionBackendToFrontend', mp);
    /*return {
      id:                   mp.id,
      measurementSettingsId: mp.messeinstellungID,
      measurementSetting:    this.measurementSettingsBackendService
                                .measurementSettingsBackendToFrontend(mp.messeinstellung!),*/
      const ms = mp.messeinstellung
                    ? this.measurementSettingsBackendService.measurementSettingsBackendToFrontend(mp.messeinstellung) : null;
      return{
      id:                  mp.id,
      measurementSettingsId: mp.messeinstellung_id,
      measurementSetting:   ms,  
      measurementProbeId:   mp.sonde_id,
      measurementProbe:     mp.sonde,
      schenkel:             mp.schenkel,
      position:             mp.position
    };
  }

  private probePositionFrontendToBackend(pp: ProbePosition): any {
    const dto: any = {
      messeinstellung_id: pp.measurementSettingsId,
      sonde_id:           pp.measurementProbeId,
      schenkel:          pp.schenkel,
      position:          pp.position
    };
    if (pp.id != null) dto.id = pp.id;
    return dto;
  }

  async getAllProbePositions(): Promise<ProbePosition[]> {
    const res = await this.backendService.httpGetRequest('SondenPosition');
    return res.map((p: any) => this.probePositionBackendToFrontend(p));
  }

  async getPositionsForMeasurementSettings(
    measurementSettingsId: number
    ): Promise<ProbePosition[]> {
    const res = await this.backendService.httpGetRequest(
      `SondenPosition/Messeinstellung/${measurementSettingsId}`
    );
    return res.map((p: any) => this.probePositionBackendToFrontend(p));
  }

  async getMeasurementProbePosition(id: number): Promise<ProbePosition> {
    const res = await this.backendService.httpGetRequest(`SondenPosition/${id}`);
    return this.probePositionBackendToFrontend(res);
  }

  async addProbePosition(pos: ProbePosition): Promise<ProbePosition> {
    const res = await this.backendService
      .httpPostRequest('SondenPosition', this.probePositionFrontendToBackend(pos));
    return this.probePositionBackendToFrontend(res);
  }

  async updateProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService
      .httpPutRequest(`SondenPosition/${pos.id}`, this.probePositionFrontendToBackend(pos));
  }

  async deleteProbePosition(pos: ProbePosition): Promise<void> {
    await this.backendService.httpDeleteRequest(`SondenPosition/${pos.id}`);
  }
}
