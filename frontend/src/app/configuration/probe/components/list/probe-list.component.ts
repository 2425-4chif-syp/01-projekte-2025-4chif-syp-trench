import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbesService } from '../../services/probes.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Probe } from '../../interfaces/probe';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router:                       Router,
    private route:                        ActivatedRoute
  ) {}

  async ngOnInit():Promise<void> {
    const queryParams = this.route.snapshot.queryParamMap;
    const selector    = queryParams.get('selector');
    const msIdParam   = queryParams.get('measurementSettingsId');
    const posIdParam  = queryParams.get('probePositionId');

    if (selector === 'probe-position') {
      this.probesService.isProbeSelector = true;

      // Kontext nach Reload wiederherstellen
      const msId  = msIdParam  ? Number(msIdParam)  : NaN;
      const posId = posIdParam ? Number(posIdParam) : NaN;

      try {
        if (!Number.isNaN(msId)) {
          await this.measurementSettingsService.reloadElementWithId(msId);
          this.measurementSettingsService.selectedElementCopy =
            this.measurementSettingsService.getCopyElement(msId);
        }

        if (!Number.isNaN(posId)) {
          await this.probePositionService.reloadElementWithId(posId);
          this.probePositionService.selectedElementCopy =
            this.probePositionService.getCopyElement(posId);
        }

        // Sicherstellen, dass die ProbePosition einen MeasurementSetting-Kontext hat
        const pos     = this.probePositionService.selectedElementCopy;
        const setting = this.measurementSettingsService.selectedElementCopy;
        if (pos && setting) {
          if (!pos.measurementSetting) {
            pos.measurementSetting = setting;
          }
          if (!pos.measurementSettingsId) {
            pos.measurementSettingsId = setting.id ?? null;
          }
        }
      } catch (err) {
        console.error('Fehler beim Wiederherstellen des Kontextes für Sondenauswahl:', err);
      }

      // Nach Wiederherstellung des Kontextes die Sondenliste neu laden,
      // damit Filter (z. B. nach Sondentyp) greifen.
      try {
        await this.probesService.reloadElements();
      } catch (err) {
        console.error('Fehler beim Neuladen der Sondenliste:', err);
      }
    }

    this.hasLoadedElementIdsToIgnore = false;
    await this.loadElementsToIgnore();
  }

  private async loadElementsToIgnore(): Promise<void> {
    if (!this.probesService.isProbeSelector) {
      this.elementIdsToIgnore = [];
      this.hasLoadedElementIdsToIgnore = true;
      return;
    }

    const currentSettingId =
      this.probePositionService.selectedElementCopy?.measurementSettingsId ??
      this.probePositionService.selectedElementCopy?.measurementSetting?.id ??
      this.measurementSettingsService.selectedElementCopy?.id ??
      null;

    if (!currentSettingId) {
      this.elementIdsToIgnore = [];
      this.hasLoadedElementIdsToIgnore = true;
      return;
    }

    try {
      // Get all probe positions for the current measurement setting
      const probePositions = await this.probePositionsBackendService.getPositionsForMeasurementSettings(currentSettingId);
      
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

      const pos = this.probePositionService.selectedElementCopy;
      if (!pos) {
        console.error('Kein Sondenpositions-Kontext für Sonde-Auswahl vorhanden.');
        this.probesService.isProbeSelector = false;
        this.router.navigate(['/measurement-settings-list']);
        return;
      }

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
