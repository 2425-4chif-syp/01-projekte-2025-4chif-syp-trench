import { Component, signal, OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeasurementSetting } from '../../interfaces/measurement-settings';
import { MeasurementSettingsService } from '../../services/measurement-settings.service';
import { Router } from '@angular/router';
import { CoilsService } from '../../../coil/services/coils.service';
import { ProbeTypesService } from '../../../probe-type/services/probe-types.service';
import { ProbePositionService } from '../../../probe-position/services/probe-position.service';
import { Coil } from '../../../coil/interfaces/coil';
import { ProbeType } from '../../../probe-type/interfaces/probe-type';
import { AlertService } from '../../../../services/alert.service';


@Component({
  selector: 'app-measurement-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent implements OnInit {
  // Optionen für "Sonden pro Schenkel" – werden dynamisch anhand Alpha und Jochanzahl berechnet
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  private lastOptionContext: { coiltypeId: number | null; alpha: number | null } = { coiltypeId: null, alpha: null };
  saveMessage: string | null = null
  saveError: boolean = false;
  showDeleteModal = false;
  originalMeasurementSetting: MeasurementSetting | null = null;

  public get selectedMeasurementSetting(): MeasurementSetting | null {
    //console.log(this.coilsService.selectedCoilCopy);
    return this.measurementSettingsService.selectedElementCopy;
  }

  public set selectedMeasurementSetting(value: MeasurementSetting) {
    this.measurementSettingsService.selectedElementCopy = value;
  }

  public get selectedSettingId(): number | undefined {
    return this.measurementSettingsService.selectedElementCopy?.id!;
  }
  public set selectedSettingId(id: number) {
    this.measurementSettingsService.selectElement(Number(id));
  }

  public get selectedCoil(): Coil | null {
    if (!this.selectedMeasurementSetting) return null;
    if (this.selectedMeasurementSetting.coil) {
      return this.selectedMeasurementSetting.coil;
    }

    return this.coilsService.elements.find(coil => coil.id === this.selectedMeasurementSetting?.coilId) ?? null;
  }

  public get selectedProbeType(): ProbeType | null {
    if (!this.selectedMeasurementSetting) return null;
    if (this.selectedMeasurementSetting.probeType) {
      return this.selectedMeasurementSetting.probeType;
    }

    return this.probeTypesService.elements.find(type => type.id === this.selectedMeasurementSetting?.probeTypeId) ?? null;
  }

  async ngOnInit() {
    if (this.selectedMeasurementSetting) {
      this.originalMeasurementSetting = { ...this.selectedMeasurementSetting };
      this.updateSondenProSchenkelOptions();
      
      // Load existing probe positions only if measurement setting already exists
      if (this.selectedMeasurementSetting.id) {
        await this.probePositionService.reloadElements();
      }
    }
  }

  constructor(public measurementSettingsService: MeasurementSettingsService, public coilsService: CoilsService, public probeTypesService: ProbeTypesService, public probePositionService: ProbePositionService, private router: Router, private alerts: AlertService){
    this.coilsService.isCoilSelector = false;
    this.probeTypesService.isMeasurementSettingsSelector = false;
  }
  
  async saveChanges() {
    if (!this.originalMeasurementSetting) return;
    if (!this.selectedMeasurementSetting) return;

    this.saveError = true; // Fehlerprüfung aktivieren

    this.selectedMeasurementSetting.name = (this.selectedMeasurementSetting.name || '').trim();

    const requiredFields: (keyof MeasurementSetting)[] = [
      'name',
      'coilId',
      'probeTypeId',
      'sondenProSchenkel',
    ];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
      this.alerts.error('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    // Plausibilitätsprüfung: Max. Sonden pro Schenkel nach Formel 360 / Joche / Alpha
    const coil = this.selectedCoil;
    const probeType = this.selectedProbeType;
    const sondenProSchenkel = Number(this.selectedMeasurementSetting.sondenProSchenkel);
    const joche = coil?.coiltype?.schenkel ?? 0;
    const alpha = probeType?.alpha ?? 0;

    if (joche > 0 && alpha > 0) {
      const maxSondenProJoch = Math.floor(360 / (joche * alpha));
      if (sondenProSchenkel > maxSondenProJoch) {
        this.alerts.error(`Die Anzahl der Sonden pro Schenkel ist nicht plausibel. Maximal zulässig: ${maxSondenProJoch}.`);
        return;
      }
    }

    try {
      this.selectedMeasurementSetting.id = this.measurementSettingsService.selectedElementCopy?.id! || 0;
      this.selectedMeasurementSetting.coilId             = Number(this.selectedMeasurementSetting.coilId);
      this.selectedMeasurementSetting.probeTypeId        = Number(this.selectedMeasurementSetting.probeTypeId);
      this.selectedMeasurementSetting.sondenProSchenkel  = Number(this.selectedMeasurementSetting.sondenProSchenkel);

      // Save measurement setting first
      await this.measurementSettingsService.updateOrCreateElement(this.selectedMeasurementSetting);
      
      // Reload the saved measurement setting to get the ID
      await this.measurementSettingsService.selectElement(this.selectedMeasurementSetting.id!);

      // Now save all probe positions using the backend service - only if measurement setting has an ID
      if (this.selectedMeasurementSetting.id) {
        await this.probePositionService.createEmptyPositions(
          this.measurementSettingsService.selectedElementCopy?.coil?.coiltype?.schenkel ?? 0,
          this.measurementSettingsService.selectedElementCopy?.sondenProSchenkel ?? 0,
          this.measurementSettingsService.selectedElementCopy!
        );
      }

      this.alerts.success('Änderungen gespeichert!');

      this.saveError = false;

      this.originalMeasurementSetting = { ...this.selectedMeasurementSetting };
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      this.alerts.error('Fehler beim Speichern!', error);
    }
  }

  async onSettingSelectionChange(SettingId: number) {
    const settingIdNumber: number = Number(SettingId);

    await this.measurementSettingsService.selectElement(settingIdNumber);
    // Load existing probe positions from backend for the selected setting
    await this.probePositionService.reloadElements();
  }

  private updateSondenProSchenkelOptions(): void {
    const coil = this.selectedCoil;
    const probeType = this.selectedProbeType;
    const coiltypeId = coil?.coiltype?.id ?? null;
    const alpha = probeType?.alpha ?? null;

    // Verhindere unnötige Reberechnungen, wenn sich Kontext nicht geändert hat
    if (this.lastOptionContext.coiltypeId === coiltypeId && this.lastOptionContext.alpha === alpha) {
      return;
    }
    this.lastOptionContext = { coiltypeId, alpha };

    if (!coil?.coiltype?.schenkel || !alpha || alpha <= 0) {
      // Fallback: Standardoptionen, falls noch keine vollständigen Daten vorhanden sind
      this.schenkelAnzahl.set([1, 2, 3, 4, 5, 6, 7, 8]);
      return;
    }

    const joche = coil.coiltype.schenkel;
    const maxRaw = 360 / (joche * alpha);
    const max = Math.floor(maxRaw);

    if (!Number.isFinite(max) || max < 1) {
      this.schenkelAnzahl.set([1]);
      if (this.selectedMeasurementSetting) {
        this.selectedMeasurementSetting.sondenProSchenkel = 1;
      }
      return;
    }

    const options = Array.from({ length: max }, (_, i) => i + 1);
    this.schenkelAnzahl.set(options);

    if (this.selectedMeasurementSetting && this.selectedMeasurementSetting.sondenProSchenkel != null) {
      if (this.selectedMeasurementSetting.sondenProSchenkel > max) {
        this.selectedMeasurementSetting.sondenProSchenkel = max;
      }
    }
  }

  isFieldInvalid(field: keyof MeasurementSetting): boolean {
    if (!this.selectedMeasurementSetting) return false;
    const value = this.selectedMeasurementSetting[field];

    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'number') {
      return value <= 0 || Number.isNaN(value);
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    return false;
  }

  coilOrProbeChanged(): boolean {
    const changed = JSON.stringify(this.selectedMeasurementSetting) !== JSON.stringify(this.originalMeasurementSetting);
    return changed;
  }

  hasChanges(): boolean {
    if (!this.selectedMeasurementSetting || !this.originalMeasurementSetting) return false;

    const fieldsToCompare: (keyof MeasurementSetting)[] = [
      'coilId',
      'probeTypeId',
      //'bemessungsspannung',
      //'bemessungsfrequenz',
      //'pruefspannung',
      'name',
      'sondenProSchenkel'
    ];

    return fieldsToCompare.some(field =>
      this.selectedMeasurementSetting![field] !== this.originalMeasurementSetting![field]
    );
  }

  openCoilSelect()
  {
    this.coilsService.selectedElementCopy = null;
    this.coilsService.isCoilSelector = true;

    this.router.navigate(['/coil-management']);
  }

  openProbeSelect()
  {
    this.probeTypesService.selectedElementCopy = null;
    this.probeTypesService.isMeasurementSettingsSelector = true;  

    this.router.navigate(['/probe-type-management']);
  }

  backToListing(){
    this.measurementSettingsService.selectedElementCopy = null;
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async deleteSetting(): Promise<void> {
    this.showDeleteModal = false;

    if (this.selectedMeasurementSetting?.id == null) return;
    
    try{
      await this.measurementSettingsService.deleteElement(this.selectedMeasurementSetting.id);
      this.alerts.success('Messeinstellung gelöscht');
    }
    catch(err){
      console.error("Fehler beim Löschen der Einstellung:", err);
      this.alerts.error('Fehler beim Löschen der Einstellung!', err);
      return;
    }

    this.backToListing();
  }
}
