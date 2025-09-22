import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Coil } from './configuration/coil/interfaces/coil';
import { Coiltype } from './configuration/coiltype/interfaces/coiltype';
import { MeasurementSetting } from './configuration/measurement-settings/interfaces/measurement-settings';
import { Measurement } from './configuration/measurement-history/interfaces/measurement.model';
import { Messwert } from './configuration/messwert/interfaces/messwert.model';
import { ProbeType } from './configuration/probe-type/interfaces/probe-type';
import { Probe } from './configuration/probe/interfaces/probe';
import { ProbePosition } from './configuration/probe-position/interfaces/probe-position.model';
import { ModeService } from './services/mode.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = environment.apiUrl;
  private readonly apiKey = environment.apiKey;

  constructor(private httpClient: HttpClient, private modeService: ModeService) { }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'charset': 'utf-8'
    });

    // API-Key nur im Admin-Modus hinzufügen
    if (this.modeService.isAdminMode()) {
      headers = headers.set('KEY', this.apiKey);
    }

    return headers;
  }

  // Endpoint is the path to the API endpoint (not starting with /), e.g. 'Spule'
  public httpGetRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      const headers = this.getHeaders();
      this.httpClient.get(this.apiUrl + endpoint, { headers }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  public httpPostRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      const headers = this.getHeaders();
      this.httpClient.post(this.apiUrl + endpoint, JSON.stringify(body), { headers }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  public httpPutRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      const headers = this.getHeaders();
      this.httpClient.put(this.apiUrl + endpoint, JSON.stringify(body), { headers }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  public httpDeleteRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      const headers = this.getHeaders();
      this.httpClient.delete(this.apiUrl + endpoint, { headers }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}