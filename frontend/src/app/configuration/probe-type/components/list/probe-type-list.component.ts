import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { ProbeTypesService as ProbeTypesService } from '../../services/probe-types.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ProbeType } from '../../interfaces/probe-type';
import { ProbesService } from '../../../probe/services/probes.service';
import { MeasurementSettingsService } from '../../../measurement-settings/services/measurement-settings.service';

@Component({
  selector: 'app-probe-type-list',
  standalone: true,
  imports: [GenericListComponent],
    providers: [
      {
        provide: LIST_SERVICE_TOKEN,
        useExisting: ProbeTypesService
      }
    ],
  templateUrl: './probe-type-list.component.html',
  styleUrl: './probe-type-list.component.scss'
})
export class ProbeTypeListComponent implements OnInit {
    public hoveredProbeType: ProbeType | null = null;
    public mousePosition: { x: number, y: number }|null = null;

    public readonly keysAsColumns: { [key: string]: string } = {
      'id': 'Messsondentyp',
      'name': 'Name',
      'breite': 'Breite',
      'hoehe': 'Höhe',
      'windungszahl': 'Windungszahl'
    }
    public readonly elementValueToStringMethods: { [key: string]: (element:ProbeType) => string } = {

    }

    constructor(
      public  probesTypesService:       ProbeTypesService,
      public  probesService:           ProbesService,
      private measurementSettingsService: MeasurementSettingsService,
      public  router:                  Router,
      private route:                   ActivatedRoute
    ) {}

    async ngOnInit(): Promise<void> {
      const queryParams = this.route.snapshot.queryParamMap;
      const selector    = queryParams.get('selector');
      const msIdParam   = queryParams.get('measurementSettingsId');
      const probeIdParam = queryParams.get('probeId');

      if (selector === 'measurement-settings') {
        this.probesTypesService.isMeasurementSettingsSelector = true;

        // Messeinstellungs-Kontext nach Reload wiederherstellen
        if (!this.measurementSettingsService.selectedElementCopy) {
          // 1) Versuch über ID (bestehende Messeinstellung)
          if (msIdParam) {
            const msId = Number(msIdParam);
            if (!Number.isNaN(msId) && msId > 0) {
              try {
                await this.measurementSettingsService.reloadElementWithId(msId);
                this.measurementSettingsService.selectedElementCopy =
                  this.measurementSettingsService.getCopyElement(msId);
                return;
              } catch (err) {
                console.error('Fehler beim Wiederherstellen der Messeinstellung für Sondentyp-Auswahl:', err);
              }
            }
          }

          // 2) Fallback: Entwurf aus LocalStorage (neue / ungespeicherte Messeinstellung)
          const draft = this.measurementSettingsService.loadDraftFromStorage();
          if (!draft) {
            // 3) Letzter Fallback: komplett neue Messeinstellung
            this.measurementSettingsService.selectedElementCopy =
              this.measurementSettingsService.newElement;
            this.measurementSettingsService.selectedElementIsNew = true;
          }
        }
      }

      if (selector === 'probe') {
        this.probesTypesService.isProbeSelector = true;

        // Sonden-Kontext nach Reload wiederherstellen
        if (!this.probesService.selectedElementCopy) {
          // 1) Versuch über ID (bestehende Sonde)
          if (probeIdParam) {
            const probeId = Number(probeIdParam);
            if (!Number.isNaN(probeId) && probeId > 0) {
              try {
                await this.probesService.reloadElementWithId(probeId);
                this.probesService.selectedElementCopy =
                  this.probesService.getCopyElement(probeId);
                this.probesService.selectedElementIsNew = false;
                return;
              } catch (err) {
                console.error('Fehler beim Wiederherstellen der Sonde für Sondentyp-Auswahl:', err);
              }
            }
          }

          // 2) Fallback: Entwurf aus LocalStorage (neue / ungespeicherte Sonde)
          const draft = this.probesService.loadDraftFromStorage();
          if (!draft) {
            // 3) Letzter Fallback: komplett neue Sonde
            this.probesService.selectedElementCopy = this.probesService.newElement;
            this.probesService.selectedElementIsNew = true;
          }
        }
      }
    }

    public get isProbeTypeSelector(): boolean {
      return this.probesTypesService.isMeasurementSettingsSelector;
    }

    public get isSelector(): boolean {
      return this.probesTypesService.isMeasurementSettingsSelector || this.probesTypesService.isProbeSelector;
    }

    openProbeType(probeType:ProbeType) {
      const id:number = probeType.id!;

      if (this.probesTypesService.isMeasurementSettingsSelector) {
        const setting = this.measurementSettingsService.selectedElementCopy;
        if (!setting) {
          console.error('Kein Messeinstellungs-Kontext für Sondentyp-Auswahl vorhanden.');
          this.probesTypesService.isMeasurementSettingsSelector = false;
          this.router.navigate(['/measurement-settings-list']);
          return;
        }

        setting.probeTypeId = id;
        setting.probeType   = probeType;

        this.router.navigate(['/measurement-settings-list']);
        return;
      }
      if (this.probesTypesService.isProbeSelector) { 
        const probe = this.probesService.selectedElementCopy;
        if (!probe) {
          console.error('Kein Sonden-Kontext für Sondentyp-Auswahl vorhanden.');
          this.probesTypesService.isProbeSelector = false;
          this.router.navigate(['/probe-management']);
          return;
        }

        probe.probeTypeId = id;
        probe.probeType   = probeType;

        this.router.navigate(['/probe-management']);
      }

      this.probesTypesService.selectElement(id);
    }

    handleBack(): void {
      if (this.probesTypesService.isMeasurementSettingsSelector) {
        this.probesTypesService.isMeasurementSettingsSelector = false;
        this.router.navigate(['/measurement-settings-list']);
        return;
      }
      if (this.probesTypesService.isProbeSelector) {
        this.probesTypesService.isProbeSelector = false;
        this.router.navigate(['/probe-management']);
        return;
      }
    }
}
