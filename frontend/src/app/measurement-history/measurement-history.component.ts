import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GenericListComponent } from '../generic-list/generic-list.component';
import { MeasurementHistoryService } from '../data/measurement-history/measurement-history.service';
import { LIST_SERVICE_TOKEN } from '../data/list-service';
import { Measurement } from '../data/measurement-history/measurement.model';

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
    'test': 'test'
  }

  public readonly elementValueToStringMethods: { [key: string]: (element: Measurement) => string } = {

  }

  test(){

  }
}
