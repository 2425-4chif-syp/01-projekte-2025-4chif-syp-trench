import { Component } from '@angular/core';
import { MeasurementHistoryService } from '../measurement-history/services/measurement-history.service';
import { MeasurementManagementComponent } from "./components/measurement-management.component";

@Component({
  selector: 'app-measurement-management-parent',
  standalone: true,
  imports: [MeasurementManagementComponent],
  templateUrl: './measurement-management-parent.component.html',
  styleUrl: './measurement-management-parent.component.scss'
})
export class MeasurementManagementParentComponent {
  constructor(public measurementHistoryService: MeasurementHistoryService) { }
}
