import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Coil } from './data/coil-data/coil';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:5127/api/';

  constructor(private httpClient: HttpClient) { }

  // Endpoint is the path to the API endpoint (not starting with /), e.g. 'Spule'
  private httpGetRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.get(this.apiUrl + endpoint).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  private httpPostRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.post(this.apiUrl + endpoint, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json', 'charset': 'utf-8' }
      }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  private httpPutRequest(endpoint:string, body:any): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.put(this.apiUrl + endpoint, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json', 'charset': 'utf-8' }
      }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }  
  private httpDeleteRequest(endpoint:string): Promise<any> | void {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.delete(this.apiUrl + endpoint).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private coilBackendToFrontend(coil: any): Coil { 
    return {
      id: coil.spuleID,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
    };
  }
  private coilFrontendToBackend(coil: Coil): any {
    return {
      spuleID: coil.id,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
    };
  }

  public async getAllCoils(): Promise<Coil[]> {
    const response:any = await this.httpGetRequest('Spule');
    return response.map((coil: any) => (this.coilBackendToFrontend(coil)));
  }

  public async getCoil(id: number): Promise<Coil> {
    const response:any = await this.httpGetRequest('Spule/' + id);
    return this.coilBackendToFrontend(response);
  }

  public async addCoil(coil: Coil): Promise<Coil> {
    const response:any = await this.httpPostRequest('Spule', this.coilFrontendToBackend(coil));
    return this.coilBackendToFrontend(response);
  }

  public async updateCoil(coil: Coil): Promise<void> {
    await this.httpPutRequest('Spule/' + coil.id, this.coilFrontendToBackend(coil));
  }

  public async deleteCoil(coil: Coil): Promise<void> {
    await this.httpDeleteRequest('Spule/' + coil.id);
  }
}
