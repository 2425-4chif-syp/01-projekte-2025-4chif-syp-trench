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

  private formatCoil(coil: any): Coil { 
    return {
      id: coil.id,
      ur: coil.ur,
      einheit: coil.einheit,
      auftragsnummer: coil.auftragsnummer,
      auftragsPosNr: coil.auftragsPosNr,
      omega: coil.omega,
    };
  }

  public async getAllCoils(): Promise<Coil[]> {
    const response:any = await this.httpGetRequest('Spule');
    return response.map((coil: any) => (this.formatCoil(coil)));
  }

  public async getCoil(id: number): Promise<Coil> {
    const response:any = await this.httpGetRequest('Spule/' + id);
    return this.formatCoil(response);
  }
}
