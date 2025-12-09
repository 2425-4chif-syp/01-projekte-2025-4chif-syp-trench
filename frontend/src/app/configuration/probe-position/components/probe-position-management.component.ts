import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Probe } from '../../probe/interfaces/probe';
import { ProbePosition } from '../interfaces/probe-position.model';
import { ProbesService } from '../../probe/services/probes.service';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';
import { ProbePositionService } from '../services/probe-position.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-probe-position-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-position-management.component.html',
  styleUrl:    './probe-position-management.component.scss'
})
export class ProbePositionManagementComponent {
  probes: Probe[] = [];

  constructor(
    private measurementSettingsService: MeasurementSettingsService,
    private probeService:               ProbesService,
    public  probePositionService:       ProbePositionService,
    private router:                     Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Only try to load if we have a valid measurement setting ID
    if (this.measurementSettingsService.selectedElementCopy?.id) {
      try {
        await this.probePositionService.reloadElements();
        this.probePositionService.loadGroupedProbePositions();
      } catch (e) {
        console.warn('Could not load probe positions:', e);
        // Reset to empty array on error
        this.probePositionService.elements = [];
        this.probePositionService.groupedProbePositions = [];
      }
    } else {
      // No measurement setting selected, clear any existing data
      this.probePositionService.elements = [];
      this.probePositionService.groupedProbePositions = [];
    }
  }

  openProbeSelector(position: ProbePosition): void {
    this.probeService.isProbeSelector = true;
    this.probePositionService.selectedElementCopy = position;
    const measurementSettingsId =
      position.measurementSettingsId ?? this.measurementSettingsService.selectedElementCopy?.id ?? null;

    this.router.navigate(['/probe-management'], {
      queryParams: {
        selector:             'probe-position',
        measurementSettingsId: measurementSettingsId ?? undefined,
        probePositionId:       position.id ?? undefined
      }
    });
  }

  deleteProbePosition(position: ProbePosition): void {
    const pos = position;
    pos.measurementProbeId = null;
    pos.measurementProbe = null;
    this.probePositionService.updateOrCreateElement(pos);
    this.probePositionService.loadGroupedProbePositions();
  }
}
