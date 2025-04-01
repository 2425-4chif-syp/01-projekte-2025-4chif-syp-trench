import { Component } from '@angular/core';
import { MeasurementProbeTypesService } from '../services/measurement-probe-types.service';
import { MeasurementProbeTypeListComponent } from './list/measurement-probe-type-list.component';
import { MeasurementProbeTypeManagementComponent } from './management/measurement-probe-type-management.component';
@Component({
  selector: 'app-measurement-probe-type-parent',
  standalone: true,
  imports: [MeasurementProbeTypeListComponent, MeasurementProbeTypeManagementComponent],
  templateUrl: './measurement-probe-type-parent.component.html',
  styleUrl: './measurement-probe-type-parent.component.scss'
})
export class MeasurementProbeTypeParentComponent {
  constructor(public measurementProbeTypesService:MeasurementProbeTypesService) { }
}
