import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Measurement } from '../interfaces/measurement.model';
import { GenericListComponent } from '../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../generic-list/services/list-service';
import { MeasurementHistoryService } from '../services/measurement-history.service';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-measurement-history',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
    providers: [
      {
        provide: LIST_SERVICE_TOKEN,
        useExisting: MeasurementHistoryService
      }
    ],
  templateUrl: './measurement-history.component.html',
  styleUrl: './measurement-history.component.scss'
})
export class MeasurementHistoryComponent {
  
  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'ID',
    'startTime': 'Startzeit',
    'endTime': 'Endzeit',
    //'measurementSettings': 'Spule'
    //'notiz': 'Notiz',
  }

  public readonly elementValueToStringMethods: { [key: string]: (element: Measurement) => string } = {
    'startTime': (element) => this.formatDate(element.anfangszeitpunkt),
    'endTime': (element) => this.formatDate(element.endzeitpunkt),
    'measurementSettings': (element) => element.measurementSettings?.coil?.coiltype?.name ?? "Unknown Coil"
  };

  /* 
  public readonly elementValueToStringMethods: { [key: string]: (element:Coil) => string } = {
      'coiltype': (element:Coil) => element.coiltype?.name ?? `Unnamed Coil (ID ${element.coiltypeId})`
    }
  */

  private formatDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
  
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
  
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const year = d.getFullYear();
  
    return `${hours}:${minutes}:${seconds} - ${month}.${day}.${year}`;
  }
  
  test(){

  }
}
