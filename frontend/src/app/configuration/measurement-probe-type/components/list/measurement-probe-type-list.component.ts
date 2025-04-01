import { Component } from '@angular/core';
import { MeasurementProbeType } from '../../data/measurement-probe-type-data/measurement-probe-type';
import { MeasurementProbeTypesService } from '../../data/measurement-probe-type-data/measurement-probe-types.service';
import { GenericListComponent } from '../../generic-list/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../data/list-service';

@Component({
  selector: 'app-measurement-probe-type-list',
  standalone: true,
  imports: [GenericListComponent],
    providers: [
      {
        provide: LIST_SERVICE_TOKEN,
        useExisting: MeasurementProbeTypesService
      }
    ],
  templateUrl: './measurement-probe-type-list.component.html',
  styleUrl: './measurement-probe-type-list.component.scss'
})
export class MeasurementProbeTypeListComponent {
    public hoveredProbeType: MeasurementProbeType | null = null;
    public mousePosition: { x: number, y: number }|null = null;
  
    public readonly keysAsColumns: { [key: string]: string } = {
      'id': 'Messsondentyp',
      'breite': 'Breite',
      'hoehe': 'Höhe',
      'wicklungszahl': 'Wicklungszahl',
      'notiz': 'Notiz'
    }
    public readonly elementValueToStringMethods: { [key: string]: (element:MeasurementProbeType) => string } = {
      
    }
  
    constructor(public measurementProbeTypesService:MeasurementProbeTypesService) {
  
    }
  
    openProbeType(probeType:MeasurementProbeType) {
      const id:number = probeType.id!;
      this.measurementProbeTypesService.selectElement(id);
    }
}
