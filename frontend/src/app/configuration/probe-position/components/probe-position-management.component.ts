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
  styleUrl: './probe-position-management.component.scss'
})
export class ProbePositionManagementComponent {
  probes: Probe[] = [];
  groupedProbePositions: ProbePosition[][] = [];
  probePositions: ProbePosition[][] = [];
  schenkelzahl = 3;
  selectedPositionForProbeSelection: ProbePosition | null = null;

  constructor(
    private measurementSettingsService: MeasurementSettingsService,
    private probeService: ProbesService,
    private probePositionService: ProbePositionService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.probePositionService.reloadElements();
    
    const einstellung = this.measurementSettingsService.selectedElementCopy!;
    const sondenProSchenkel = einstellung.sondenProSchenkel ?? 0;

    this.probePositionService.createEmptyPositions(
      this.schenkelzahl,
      sondenProSchenkel,
      einstellung
    );

    console.log(this.probePositionService.elements);
    this.loadGroupedProbePositions();
  }

  openProbeSelector(position: ProbePosition) {
    console.log('Opening probe selector for position:', position);
    console.log(this.probeService.isProbeSelector);
    this.selectedPositionForProbeSelection = null;
    this.probeService.isProbeSelector = true;
    console.log(this.probeService.isProbeSelector);
    this.probePositionService.selectedElementCopy = position;
    
    this.router.navigate(['/probe-management']);
  }

  loadGroupedProbePositions(): void {
    this.groupedProbePositions = this.probePositionService.getGroupedProbePositions();
  }

}
