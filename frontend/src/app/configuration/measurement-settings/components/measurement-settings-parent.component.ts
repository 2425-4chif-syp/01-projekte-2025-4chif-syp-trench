import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MeasurementSettingsService } from '../services/measurement-settings.service';
import { MeasurementSettingsListComponent } from './list/measurement-settings-list.component';
import { MeasurementSettingsComponent } from './management/measurement-settings.component';
import { ProbePositionManagementComponent } from "../../probe-position/components/probe-position-management.component";
import { MessungService } from '../../messung/services/messung.service';
import { MeasurementSetting } from '../interfaces/measurement-settings';

@Component({
  selector: 'app-measurement-settings-parent',
  standalone: true,
  imports: [CommonModule, MeasurementSettingsListComponent, MeasurementSettingsComponent, ProbePositionManagementComponent],
  templateUrl: './measurement-settings-parent.component.html',
  styleUrl: './measurement-settings-parent.component.scss'
})
export class MeasurementSettingsParentComponent {

  constructor(
    public measurementSettingsService: MeasurementSettingsService,
    private messungService: MessungService,
    private router: Router
  ) {
  }

  onSelectForMeasurement(setting: MeasurementSetting): void {
    if (this.messungService.selectedElementCopy) {
      this.messungService.selectedElementCopy.messeinstellungId = setting.id ?? null;
      this.messungService.selectedElementCopy.messeinstellung = setting;
    }

    this.measurementSettingsService.isMeasurementSelector = false;
    this.router.navigate(['/measurement-management']);
  }

  onCancelMeasurementSelection(): void {
    this.measurementSettingsService.isMeasurementSelector = false;
    this.router.navigate(['/measurement-management']);
  }
}
