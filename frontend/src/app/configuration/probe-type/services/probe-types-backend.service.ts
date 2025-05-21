import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { ProbeType } from '../interfaces/probe-type';

@Injectable({
  providedIn: 'root'
})
export class ProbeTypesBackendService {

  constructor(private backendService:BackendService) { }

  private probeTypeBackendToFrontend(probeType: any): ProbeType {
    return {
      id: probeType.id,
      name: probeType.name,
      breite: probeType.breite,
      hoehe: probeType.hoehe,
      windungszahl: probeType.windungszahl,
      notiz: probeType.notiz
    };
  }
  private probeTypeFrontendToBackend(probeType: ProbeType): any {
    return {
      id: probeType.id,
      name: probeType.name,
      breite: probeType.breite,
      hoehe: probeType.hoehe,
      windungszahl: probeType.windungszahl,
      notiz: probeType.notiz
    };
  }

  public async getAllProbeTypes(): Promise<ProbeType[]> {
    const response:any = await this.backendService.httpGetRequest('SondenTyp');
    return response.map((measurementProbeType: any) => (this.probeTypeBackendToFrontend(measurementProbeType)));
  }
  public async getProbeType(id: number): Promise<ProbeType> {
    const response:any = await this.backendService.httpGetRequest('SondenTyp/' + id);
    return this.probeTypeBackendToFrontend(response);
  }
  public async addProbeType(measurementProbeType:ProbeType): Promise<ProbeType> {
    const response:any = await this.backendService.httpPostRequest('SondenTyp', this.probeTypeBackendToFrontend(measurementProbeType));
    return this.probeTypeBackendToFrontend(response);
  }
  public async updateProbeType(measurementProbeType: ProbeType): Promise<void> {
    await this.backendService.httpPutRequest('SondenTyp/' + measurementProbeType.id, this.probeTypeFrontendToBackend(measurementProbeType));
  }
  public async deleteProbeType(measurementProbeType: ProbeType): Promise<void> {
    await this.backendService.httpDeleteRequest('SondenTyp/' + measurementProbeType.id);
  }
}
