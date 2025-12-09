import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MeasurementSettingsService } from '../services/measurement-settings.service';
import { ProbePositionService } from '../../probe-position/services/probe-position.service';
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
export class MeasurementSettingsParentComponent implements OnInit, AfterViewInit {

  constructor(
    public measurementSettingsService: MeasurementSettingsService,
    private messungService: MessungService,
    private router: Router,
    private route: ActivatedRoute,
    private probePositionService: ProbePositionService
  ) {
  }

  ngOnInit(): void {
    const selector = this.route.snapshot.queryParamMap.get('selector');
    if (selector === 'messung') {
      this.measurementSettingsService.isMeasurementSelector = true;

      // Sicherstellen, dass es einen Messungs-Kontext gibt, auch nach Reload
      if (!this.messungService.selectedElementCopy) {
        // 1) Versuch: Entwurf aus LocalStorage laden
        const draft = this.messungService.loadDraftFromStorage();
        if (!draft) {
          // 2) Fallback: komplett neue Messung
          this.messungService.selectedElementCopy = this.messungService.newElement;
          this.messungService.selectedElementIsNew = true;
        }
      }
    }
  }

  // Ensure probe position tables are loaded when a measurement setting is already selected
  async ngAfterViewInit(): Promise<void> {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(async () => {
      if (this.measurementSettingsService.selectedElementCopy?.id) {
        try {
          await this.probePositionService.reloadElements();
        } catch (e) {
          // swallow - component will render an empty state if backend fails
          console.warn('Could not load probe positions in parent after view init', e);
        }
      }
    }, 0);
  }

  onSelectForMeasurement(setting: MeasurementSetting): void {
    if (this.messungService.selectedElementCopy) {
      this.messungService.selectedElementCopy.messeinstellungId = setting.id ?? null;
      this.messungService.selectedElementCopy.messeinstellung = setting;

      // Aktualisierten Messungs-Entwurf (inkl. gewählter Messeinstellung) speichern
      this.messungService.saveDraftToStorage();
    }

    this.measurementSettingsService.isMeasurementSelector = false;
    this.router.navigate(['/measurement-management']);
  }

  onCancelMeasurementSelection(): void {
    this.measurementSettingsService.isMeasurementSelector = false;
    this.router.navigate(['/measurement-management']);
  }
}
