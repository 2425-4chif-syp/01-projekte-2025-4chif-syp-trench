import { Component, signal } from '@angular/core';
import { Probe } from '../../probe/interfaces/probe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';
import { MeasurementSettingsComponent } from '../../measurement-settings/components/management/measurement-settings.component';
import { ProbePositionsBackendService } from '../services/probe-positions-backend.service';
import { ProbesService } from '../../probe/services/probes.service';
import { ProbesBackendService } from '../../probe/services/probes-backend.service';
import { ProbePosition } from '../interfaces/probe-position.model';

@Component({
  selector: 'app-probe-position-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-position-management.component.html',
  styleUrl: './probe-position-management.component.scss'
})
export class ProbePositionManagementComponent {
  constructor(private measurementSettingsService: MeasurementSettingsService, private probeService: ProbesService) {}
  probes: Probe[] = [];
  probePositions: ProbePosition[][] = [];
  schenkelzahl = 3;
  
  async ngOnInit(): Promise<void> {
    console.log("Initialisiere Komponente...");
  
    await this.probeService.reloadElements().then(() => {
      this.probes = this.probeService.elements;
      console.log("Proben geladen:", this.probes);
    }
    );
    console.log("Sonden geladen:", this.probeService.elements);
    
    console.log(this.measurementSettingsService.selectedElementCopy);

    //await this.generateAndSavePositions();

    this.createProbePositions();
  } 

  createProbePositions(): void {
    this.probePositions = [];
    for (let i = 0; i < this.schenkelzahl; i++) {
      this.probePositions[i] = [];
      for (let j = 0; j < this.measurementSettingsService.selectedElementCopy?.sondenProSchenkel!; j++) {
        const probePosition: ProbePosition = {
          id: 0,
          measurementSettingsId: this.measurementSettingsService.selectedElementCopy!.id,
          measurementSetting: this.measurementSettingsService.selectedElementCopy,
          measurementProbeId: null,
          measurementProbe: null,
          schenkel: i + 1,
          position: j + 1
        };
        this.probePositions[i].push(probePosition);
      }
    }

    console.log("ProbePositionen erstellt:", this.probePositions);
  }  
}
