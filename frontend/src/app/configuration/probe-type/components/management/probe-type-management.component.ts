import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProbeTypesService } from '../../services/probe-types.service';
import { ProbeType } from '../../interfaces/probe-type';

type ProbeTypeField = keyof ProbeType;

@Component({
  selector: 'app-probe-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-type-management.component.html',
  styleUrl: './probe-type-management.component.scss'
})
export class ProbeTypeManagementComponent implements OnInit {
  saveMessage: string | null = null;
  saveError = false;
  originalProbeType: ProbeType | null = null;
  showDeleteModal = false;
  private selectedProbeTypeIdInternal?: number;

  constructor(public measurementProbeTypesService: ProbeTypesService) {}

  ngOnInit(): void {
    if (this.selectedProbeType) {
      this.originalProbeType = { ...this.selectedProbeType };
      this.selectedProbeTypeIdInternal = this.selectedProbeType.id ?? undefined;
    }
  }

  get selectedProbeType(): ProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  get selectedProbeTypeId(): number | undefined {
    return this.measurementProbeTypesService.selectedElementCopy?.id ?? this.selectedProbeTypeIdInternal;
  }

  set selectedProbeTypeId(value: number | undefined) {
    this.selectedProbeTypeIdInternal = value != null ? Number(value) : undefined;
  }

  hasChanges(): boolean {
    if (!this.originalProbeType || !this.selectedProbeType) {
      return false;
    }
    return JSON.stringify(this.originalProbeType) !== JSON.stringify(this.selectedProbeType);
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (!this.selectedProbeType) {
      return;
    }

    this.saveError = true;
    form.form.markAllAsTouched();

    const requiredFields: ProbeTypeField[] = ['name', 'hoehe', 'breite', 'windungszahl'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (form.invalid || invalidFields.length > 0) {
      this.saveMessage = 'Bitte füllen Sie alle Pflichtfelder aus.';
      setTimeout(() => (this.saveMessage = null), 3000);
      return;
    }

    try {
      if (this.selectedProbeType.notiz === null) {
        this.selectedProbeType.notiz = '';
      }

      await this.measurementProbeTypesService.updateOrCreateElement(this.selectedProbeType);

      if (this.selectedProbeType.id != null) {
        await this.measurementProbeTypesService.selectElement(this.selectedProbeType.id);
      }

      this.saveMessage = 'Änderungen gespeichert!';
      setTimeout(() => (this.saveMessage = null), 2000);

      this.saveError = false;
      this.originalProbeType = this.selectedProbeType ? { ...this.selectedProbeType } : null;
      this.selectedProbeTypeIdInternal = this.selectedProbeType?.id ?? undefined;
      form.form.markAsPristine();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      this.saveMessage = 'Fehler beim Speichern!';
    }
  }

  isFieldInvalid(field: ProbeTypeField): boolean {
    if (!this.selectedProbeType) {
      return false;
    }

    const value = this.selectedProbeType[field];

    switch (field) {
      case 'name': {
        const name = typeof value === 'string' ? value.trim() : '';
        return name.length < 2;
      }
      case 'breite':
      case 'hoehe':
      case 'windungszahl': {
        if (value === null || value === undefined) {
          return true;
        }
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return true;
        }
        return numericValue <= 0;
      }
      default:
        return value === null || value === undefined;
    }
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async confirmDeleteProbeType(): Promise<void> {
    this.showDeleteModal = false;

    if (this.selectedProbeType === null) {
      return;
    }

    await this.measurementProbeTypesService.deleteElement(this.selectedProbeType.id!);
    this.selectedProbeTypeIdInternal = undefined;
    this.originalProbeType = null;
    this.saveMessage = null;
    this.saveError = false;
    this.backToListing();
  }

  async onProbeTypeSelectionChange(probeTypeId: number): Promise<void> {
    const numericId = Number(probeTypeId);
    await this.measurementProbeTypesService.selectElement(numericId);
    this.selectedProbeTypeIdInternal = this.measurementProbeTypesService.selectedElementCopy?.id ?? numericId;
    this.originalProbeType = this.selectedProbeType ? { ...this.selectedProbeType } : null;
    this.saveError = false;
    this.saveMessage = null;
  }

  backToListing(): void {
    this.measurementProbeTypesService.selectedElementCopy = null;
    this.originalProbeType = null;
    this.selectedProbeTypeIdInternal = undefined;
    this.saveMessage = null;
    this.saveError = false;
  }

  get scale(): number {
    return 2;
  }

  get scaledWidth(): number {
    return (this.selectedProbeType?.breite ?? 0) * this.scale;
  }

  get scaledHeight(): number {
    return (this.selectedProbeType?.hoehe ?? 0) * this.scale;
  }
}
