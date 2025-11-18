import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbesService } from '../../services/probes.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Probe } from '../../interfaces/probe';
import { Router } from '@angular/router';
import { ProbePositionService } from '../../../probe-position/services/probe-position.service';
import { ProbePosition } from '../../../probe-position/interfaces/probe-position.model';
import { ProbePositionsBackendService } from '../../../probe-position/services/probe-positions-backend.service';
import { MeasurementSettingsService } from '../../../measurement-settings/services/measurement-settings.service';

@Component({
  selector: 'app-probe-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    { provide: LIST_SERVICE_TOKEN, useExisting: ProbesService }
  ],
  templateUrl: './probe-list.component.html',
  styleUrl:    './probe-list.component.scss'
})
export class ProbeListComponent {
  get isProbeSelector(): boolean {
    return this.probesService.isProbeSelector;
  }

  public hasLoadedElementIdsToIgnore: boolean = false;
  public elementIdsToIgnore: number[] = [];

  readonly keysAsColumns: { [key: string]: string } = {
    id: 'Spule',
    name: 'Name',
    probeType: 'Sondentyp',
    kalibrierungsfaktor: 'Kalibrierungsfaktor'
  };

  readonly elementValueToStringMethods = {
    probeType: (e: Probe) => e.probeType?.name ?? `Unnamed ProbeType (ID ${e.probeTypeId})`
  };

  constructor(
    public  probesService:                ProbesService,
    private probePositionService:         ProbePositionService,
    private probePositionsBackendService: ProbePositionsBackendService,
    private measurementSettingsService:   MeasurementSettingsService,
    private router:                       Router
  ) {}

  async ngOnInit():Promise<void> {
    this.hasLoadedElementIdsToIgnore = false;
    await this.loadElementsToIgnore();
  }

  private async loadElementsToIgnore(): Promise<void> {
    if (!this.probesService.isProbeSelector) {
      this.elementIdsToIgnore = [];
      this.hasLoadedElementIdsToIgnore = true;
      return;
    }

    const currentSetting = this.probePositionService.selectedElementCopy?.measurementSetting;
    if (!currentSetting || !currentSetting.id) {
      this.elementIdsToIgnore = [];
      this.hasLoadedElementIdsToIgnore = true;
      return;
    }

    try {
      // Get all probe positions for the current measurement setting
      const probePositions = await this.probePositionsBackendService.getPositionsForMeasurementSettings(currentSetting.id);
      
      // Get the currently selected position to exclude it from the filter
      const currentPositionId = this.probePositionService.selectedElementCopy?.id;
      
      // Filter out probes already assigned to other positions in this measurement setting
      // But allow re-selecting the same probe for the current position (when editing)
      this.elementIdsToIgnore = probePositions 
        .filter(pp => pp.measurementProbeId != null && pp.id !== currentPositionId)
        .map(pp => pp.measurementProbe!.id)
        .filter((value, index, self) => self.indexOf(value) === index); // distinct ids
        
    } catch (error) {
      console.error('Error loading assigned probes:', error);
      this.elementIdsToIgnore = [];
    }

    this.hasLoadedElementIdsToIgnore = true;

    console.log('ProbeListComponent.loadElementsToIgnore() called, elementsToIgnore set to:', this.elementIdsToIgnore);
  }

  handleBack(){
    this.probesService.isProbeSelector = false;
    this.router.navigate(['/measurement-settings-list']);
    console.log('ProbeListComponent.handleBack() called, isProbeSelector set to false');
  }


  openProbe(probe: Probe): void {

    if (this.probesService.isProbeSelector) {

      const pos = this.probePositionService.selectedElementCopy!;
      pos.measurementProbeId  = probe.id;
      pos.measurementProbe    = probe;

      // Save the probe position assignment immediately
      this.probePositionService.updateOrCreateElement(pos).then(() => {
        this.probesService.isProbeSelector = false;
        this.router.navigate(['/measurement-settings-list']);
      });
      return;
    }

    this.probesService.selectElement(probe.id!);
  }
}