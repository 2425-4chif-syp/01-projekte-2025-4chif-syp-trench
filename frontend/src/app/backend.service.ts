import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class BackendService {    
  private apiUrl = 'http://localhost:5127/api/';

  constructor(private httpClient:HttpClient) { }

  public getAllCoils():Promise<any>|void  {
    return new Promise<any>((resolve, reject) => {
      this.httpClient.get(this.apiUrl + 'Spule').subscribe({
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
