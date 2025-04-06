import { Component } from '@angular/core';
import { MeasurementHistoryComponent } from "../../measurement-history/components/measurement-history.component";

@Component({
  selector: 'app-measurement-management',
  standalone: true,
  imports: [MeasurementHistoryComponent],
  templateUrl: './measurement-management.component.html',
  styleUrl: './measurement-management.component.scss'
})
export class MeasurementManagementComponent {

}
