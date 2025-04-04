import { Component } from '@angular/core';
import { MeasurementHistoryComponent } from "../../measurement-history/components/measurement-history.component";

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [MeasurementHistoryComponent],
  templateUrl: './components.component.html',
  styleUrl: './components.component.scss'
})
export class MeasurementManagementComponent {

}
