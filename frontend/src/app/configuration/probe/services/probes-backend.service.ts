import { Injectable } from '@angular/core';
import { BackendService } from '../../../backend.service';
import { Probe } from '../interfaces/probe';

@Injectable({
  providedIn: 'root'
})
export class ProbesBackendService {

  constructor(private backendService:BackendService) { }

  private probeBackendToFrontend(measurementProbe: any): Probe {
    return {
      id: measurementProbe.id,
      probeType: measurementProbe.sondenTyp,
      probeTypeId: measurementProbe.sondenTypID,
      name: measurementProbe.name,
      kalibrierungsfaktor: measurementProbe.kalibrierungsfaktor,
    }
  }

  private probeFrontendToBackend(measurementProbe: Probe): any {
    return {
      id: measurementProbe.id,
      sondenTypID: measurementProbe.probeTypeId,
      name: measurementProbe.name,
      kalibrierungsfaktor: measurementProbe.kalibrierungsfaktor,
    }
  }

  public async getAllProbes(): Promise<Probe[]> {
    const response: any = await this.backendService.httpGetRequest('Sonde');
    return response.map((probe: any) => this.probeBackendToFrontend(probe));
  }
  
  public async getProbe(id: number): Promise<Probe> {
    const response: any = await this.backendService.httpGetRequest('Sonde/' + id);
    return this.probeBackendToFrontend(response);
  }

  public async addProbe(probe: Probe): Promise<Probe> {
    const response: any = await this.backendService.httpPostRequest('Sonde', this.probeFrontendToBackend(probe));
    return this.probeBackendToFrontend(response);
  }

  public async updateProbe(probe: Probe): Promise<void> {
    await this.backendService.httpPutRequest('Sonde/' + probe.id, this.probeFrontendToBackend(probe));
  }

  public async deleteProbe(probe: Probe): Promise<void> {
    await this.backendService.httpDeleteRequest('Sonde/' + probe.id);
  }
}
