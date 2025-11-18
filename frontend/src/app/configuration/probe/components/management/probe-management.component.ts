import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProbesService } from '../../services/probes.service';
import { Probe } from '../../interfaces/probe';
import { ProbeTypesService } from '../../../probe-type/services/probe-types.service';
import { ProbeType } from '../../../probe-type/interfaces/probe-type';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-probe-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './probe-management.component.html',
  styleUrl: './probe-management.component.scss'
})
export class ProbeManagementComponent {
  constructor(public probesService: ProbesService, private probeTypesService: ProbeTypesService, private router:Router, private alerts: AlertService) {
    this.probeTypesService.isMeasurementSettingsSelector = false;
    this.probeTypesService.reloadElements();
  }

  saveMessage: string | null = null;
  saveError: boolean = false;
  selectedProbeIsNew: boolean = false;
  originalProbe: Probe | null = null;

  ngOnInit() {
    if (!this.selectedProbe) {
      // Entwurf nach Reload wiederherstellen (falls vorhanden)
      this.probesService.loadDraftFromStorage();
    }

    this.syncOriginalProbeSnapshot();
  }

  public get selectedProbe(): Probe | null {
    return this.probesService.selectedElementCopy;
  }

  public get selectedProbeId(): number | undefined {
    return this.probesService.selectedElementCopy?.id!;
  }
  public set selectedProbeId(id: number) {
    this.probesService.selectElement(Number(id));
  }

  public get selectedProbetype(): ProbeType|null {
    //console.log(this.selectedProbe);

    if (this.selectedProbe?.probeType ?? null !== null) {
      return this.selectedProbe?.probeType!;
    }

    return this.probeTypesService.elements.find(c => c.id === this.selectedProbe?.probeTypeId) ?? null;
  }

  hasChanges(): boolean {
    if (!this.selectedProbe) return false;

    // For new probes, treat any non-empty field as a change
    if (this.probesService.selectedElementIsNew || this.selectedProbe.id == null || this.selectedProbe.id === 0) {
      const p = this.selectedProbe;
      const hasName = (p.name?.trim()?.length ?? 0) > 0;
      const hasCalibration = p.kalibrierungsfaktor != null && !Number.isNaN(p.kalibrierungsfaktor);
      const hasProbeType = (p.probeTypeId ?? 0) > 0 || p.probeType != null;

      return hasName || hasCalibration || hasProbeType;
    }

    if (!this.originalProbe) return false;
    return JSON.stringify(this.originalProbe) !== JSON.stringify(this.selectedProbe);
 }

  isFieldInvalid(field: keyof Probe): boolean {
    if (!this.selectedProbe) return false;
    const value = this.selectedProbe[field];

    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'number') {
      return value <= 0;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    return false;
  }


  openProbetypeSelect() {
    // Aktuellen Sondenentwurf sichern, bevor in die Sondentyp-Auswahl gewechselt wird
    this.probesService.saveDraftToStorage();

    this.probeTypesService.selectedElementCopy = null;
    this.probeTypesService.isProbeSelector = true;

    const probeId = this.selectedProbeId ?? 0;

    this.router.navigate(['/probe-type-management'], {
      queryParams: {
        selector: 'probe',
        probeId:  probeId || undefined
      }
    });
  }

  async saveChanges() {
    if (!this.selectedProbe) return;

    this.saveError = true;

    const requiredFields: (keyof Probe)[] = ['name', 'kalibrierungsfaktor'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
        this.alerts.error('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    try {
        await this.probesService.updateOrCreateElement(this.selectedProbe);
        await this.onProbeSelectionChange(this.selectedProbeId!);

        this.alerts.success('Änderungen gespeichert!');

        this.saveError = false;
        this.probesService.clearDraftFromStorage();
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        this.alerts.error('Fehler beim Speichern!', error);
    }
}

  writeSaveMessage(message:string) {
    this.saveMessage = message;
    setTimeout(() => {
      this.saveMessage = null;
    }, 1500);
  }

  async onProbeSelectionChange(probeId: number) {
    const probeIdNumber: number = Number(probeId);

    await this.probesService.selectElement(probeIdNumber);
    this.syncOriginalProbeSnapshot();
    this.saveError = false;
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async deleteProbe(): Promise<void> {
    this.showDeleteModal = false;

    if (this.probesService.selectedElementCopy === null) {
      return;
    }

    await this.probesService.deleteElement(this.probesService.selectedElementCopy.id!);
    this.probesService.clearDraftFromStorage();
  }

  backToListing(): void {
    this.probesService.selectedElementCopy = null;
    this.originalProbe = null;
    this.probesService.clearDraftFromStorage();
  }

  showProbetypeDropdown: boolean = false;

  toggleCoiltypeDropdown() {
    //console.log(this.coilsService.selectCoil);
    this.showProbetypeDropdown = !this.showProbetypeDropdown;
  }

  selectProbetype(probetypeId: number) {
    if (this.selectedProbe !== null) {
      this.selectedProbe.probeTypeId = probetypeId;
    } else {
      console.error('selectedProbe is null');
    }
    this.showProbetypeDropdown = false;
  }


  getProbetypeName(): string {
    if (!this.selectedProbeId) return 'Sondentyp auswählen';
    const probe = this.probesService.elements.find(probe => probe.id === this.selectedProbeId);
    const probetype = this.probeTypesService.elements.find(type => type.id === this.selectedProbe?.probeTypeId);
    return probetype ? probetype.name! : 'Sondentyp auswählen';
  }

  private syncOriginalProbeSnapshot(): void {
    const selected = this.selectedProbe;

    if (!selected) {
      this.originalProbe = null;
      return;
    }

    if (this.probesService.selectedElementIsNew || selected.id == null || selected.id === 0) {
      this.originalProbe = { ...selected };
      return;
    }

    try {
      this.originalProbe = this.probesService.getCopyElement(selected.id);
    } catch (error) {
      // Fallback to current values if original data is unavailable
      this.originalProbe = { ...selected };
    }
  }

  onFieldChange(): void {
    this.probesService.saveDraftToStorage();
  }
}
