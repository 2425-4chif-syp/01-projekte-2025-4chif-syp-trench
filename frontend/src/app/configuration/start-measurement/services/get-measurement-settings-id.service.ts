import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MeasurementSetting {
  id: number;
  bemessungsspannung: number;
  bemessungsfrequenz: number;
  pruefspannung: number;
  sondenProSchenkel: number;
  notiz?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementSettingsService {
  private apiUrl = 'http://localhost:5127/api/Messeinstellung';

  constructor(private http: HttpClient) {}

  getMeasurementSettings(): Observable<MeasurementSetting[]> {
    return this.http.get<MeasurementSetting[]>(this.apiUrl);
  }

  getMeasurementSetting(id: number): Observable<MeasurementSetting> {
    return this.http.get<MeasurementSetting>(`${this.apiUrl}/${id}`);
  }
} 