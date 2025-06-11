import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessungListComponent } from './list/messung-list.component';
import { StartMeasurementComponent } from '../start-measurement/start-measurement.component';
// import { CoilManagementComponent } from './management/messung-management.component';
import { MessungService } from './services/messung.service';

@Component({
  selector: 'app-messung-parent',
  standalone: true,
  imports: [CommonModule, MessungListComponent, StartMeasurementComponent],
  templateUrl: './messung-parent.component.html',
  styleUrl: './messung-parent.component.scss'
})
export class MessungParentComponent {
  constructor(public messungService:MessungService) {}

  navigateToRunningMeasurement(): void {
    if (this.messungService.isCurrentlyMeasuring()) {
      this.messungService.selectedElementCopy = this.messungService.newElement;
    }
  }
}
