import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Measurement } from '../interfaces/measurement.model';
import { GenericListComponent } from '../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../generic-list/services/list-service';
import { MeasurementHistoryService } from '../services/measurement-history.service';

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
