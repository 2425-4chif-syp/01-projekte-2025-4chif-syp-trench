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
  groupedProbePositions: ProbePosition[][] = [];
  schenkelzahl = 3;

  constructor(
    private measurementSettingsService: MeasurementSettingsService,
    private probeService:              ProbesService,
    private probePositionService:      ProbePositionService,
    private router:                    Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.probePositionService.reloadElements();

    const einstellung        = this.measurementSettingsService.selectedElementCopy!;
    const sondenProSchenkel  = einstellung.sondenProSchenkel ?? 0;

    this.probePositionService.elements =
      this.probePositionService.elements
        .filter(p => p.measurementSettingsId === einstellung.id);

    this.probePositionService.createEmptyPositions(
      this.schenkelzahl,
      sondenProSchenkel,
      einstellung
    );

    this.loadGroupedProbePositions();
  }

  openProbeSelector(position: ProbePosition): void {
    this.probeService.isProbeSelector = true;
    this.probePositionService.selectedElementCopy = position;
    this.router.navigate(['/probe-management']);
  }

  loadGroupedProbePositions(): void {
    this.groupedProbePositions = this.probePositionService.getGroupedProbePositions();
  }
}
