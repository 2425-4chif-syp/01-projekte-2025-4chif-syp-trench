import { Component } from '@angular/core';
import { MeasurementProbeTypeListComponent } from '../measurement-probe-type-list/measurement-probe-type-list.component';
import { MeasurementProbeManagementComponent } from "../../measurement-settings/measurement-probe-management/measurement-probe-management.component";
import { MeasurementProbeTypeManagementComponent } from '../measurement-probe-type-management/measurement-probe-type-management.component';
import { MeasurementProbeTypesService } from '../../data/measurement-probe-type-data/measurement-probe-types.service';

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
