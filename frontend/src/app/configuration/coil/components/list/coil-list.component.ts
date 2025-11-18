import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CoilsService } from '../../services/coils.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Coil } from '../../interfaces/coil';
import { ActivatedRoute, Router } from '@angular/router';
import { MeasurementSettingsService } from '../../../measurement-settings/services/measurement-settings.service';

@Component({
  selector: 'app-coil-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: CoilsService
    }
  ],
  templateUrl: './coil-list.component.html',
  styleUrl: './coil-list.component.scss'
})
export class CoilListComponent implements OnInit {
  public hoveredCoil: Coil | null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public get isCoilSelector(): boolean {
    return this.coilsService.isCoilSelector;
  }

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Spule',
    'coiltype': 'Spulentyp',
    'auftragsnummer': 'AuftragsNr',
    'auftragsPosNr': 'AuftragsPosNr',
    'einheit': 'Einheit',
    'bemessungsspannung': 'Bemessungsspannung',
    'bemessungsfrequenz': 'Bemessungsfrequenz'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Coil) => string } = {
    'coiltype': (element:Coil) => element.coiltype?.name ?? `Unbekannte Spule (ID ${element.coiltypeId})`
  }

  constructor(
    public  coilsService:              CoilsService,
    public  measurementSettingsService: MeasurementSettingsService,
    private router:                   Router,
    private route:                    ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const queryParams = this.route.snapshot.queryParamMap;
    const selector    = queryParams.get('selector');
    const msIdParam   = queryParams.get('measurementSettingsId');

    if (selector === 'measurement-settings') {
      this.coilsService.isCoilSelector = true;

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
              console.error('Fehler beim Wiederherstellen der Messeinstellung für Spulenauswahl:', err);
            }
          }
        }

        // 2) Fallback: Entwurf aus LocalStorage (neue oder noch nicht gespeicherte Messeinstellung)
        const draft = this.measurementSettingsService.loadDraftFromStorage();
        if (!draft) {
          // 3) Letzter Fallback: komplett neue Messeinstellung
          this.measurementSettingsService.selectedElementCopy =
            this.measurementSettingsService.newElement;
          this.measurementSettingsService.selectedElementIsNew = true;
        }
      }
    }
  }

  openCoil(coil:Coil) {
    const coilId = coil.id!;

    if (this.coilsService.isCoilSelector) {
      const setting = this.measurementSettingsService.selectedElementCopy;
      if (!setting) {
        console.error('Kein Messeinstellungs-Kontext für Spulenauswahl vorhanden.');
        this.coilsService.isCoilSelector = false;
        this.router.navigate(['/measurement-settings-list']);
        return;
      }

      setting.coilId = coilId;
      setting.coil   = this.coilsService.getCopyElement(coilId);

      this.router.navigate(['/measurement-settings-list']);
      return;
    }

    this.coilsService.selectElement(coilId);
  }

  handleBack(): void {
    if (this.coilsService.isCoilSelector) {
      this.coilsService.isCoilSelector = false;
      this.router.navigate(['/measurement-settings-list']);
    }
  }
}
