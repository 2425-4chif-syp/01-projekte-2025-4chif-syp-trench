import { Component, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProbesService } from '../../services/probes.service';
import { MeasurementProbeTypesService } from '../../../measurement-probe-type/services/measurement-probe-types.service';
import { Probe } from '../../interfaces/probe';
import { MeasurementProbeType } from '../../../measurement-probe-type/interfaces/measurement-probe-type';

@Component({
  selector: 'app-probe-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './probe-management.component.html',
  styleUrl: './probe-management.component.scss'
})
export class ProbeManagementComponent {
  constructor(public probesService: ProbesService, private measurementProbeTypesService: MeasurementProbeTypesService, private router:Router) {
    this.measurementProbeTypesService.isProbeSelector = false;
    this.measurementProbeTypesService.reloadElements();
  }

  saveMessage: string | null = null;
  saveError: boolean = false;
  selectedProbeIsNew: boolean = false;
  originalProbe: Probe | null = null;

  ngOnInit() {
    if (this.selectedProbe) {
        this.originalProbe = { ...this.selectedProbe };
    }
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

  public get selectedProbetype(): MeasurementProbeType|null {
    //console.log(this.selectedProbe);

    if (this.selectedProbe?.probeType ?? null !== null) {
      return this.selectedProbe?.probeType!;
    }

    return this.measurementProbeTypesService.elements.find(c => c.id === this.selectedProbe?.probeTypeId) ?? null;
  }

  hasChanges(): boolean {
    if (!this.originalProbe || !this.selectedProbe) return false;
    return JSON.stringify(this.originalProbe) !== JSON.stringify(this.selectedProbe);
 }

  isFieldInvalid(field: keyof Probe): boolean {
    if (!this.selectedProbe) return false;
    let value = this.selectedProbe[field];
    return value === null || value === undefined || (typeof value === 'number' && value <= 0);
  }


  openProbetypeSelect() {
    this.measurementProbeTypesService.selectedElementCopy = null;
    this.measurementProbeTypesService.isProbeSelector = true;

    this.router.navigate(['/measurement-probe-type-management']);
  }

  async saveChanges() {
    if (!this.selectedProbe) return;

    this.saveError = true;

    const requiredFields: (keyof Probe)[] = ['name', 'kalibrierungsfaktor'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
        this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
        return;
    }

    try {
        await this.probesService.updateOrCreateElement(this.selectedProbe);
        this.onProbeSelectionChange(this.selectedProbeId!);

        this.saveMessage = "Änderungen gespeichert!";
        setTimeout(() => {
            this.saveMessage = null;
        }, 3000);

        this.saveError = false;
        this.originalProbe = { ...this.selectedProbe };
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        this.saveMessage = "Fehler beim Speichern!";
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
  }

  backToListing(): void {
    this.probesService.selectedElementCopy = null;
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
    const probetype = this.measurementProbeTypesService.elements.find(type => type.id === this.selectedProbe?.probeTypeId);
    return probetype ? probetype.name! : 'Sondentyp auswählen';
  }
}

