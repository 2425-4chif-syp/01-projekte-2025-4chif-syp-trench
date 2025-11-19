import { CommonModule } from '@angular/common';
import { Component, DoCheck, OnInit, Input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProbeType } from '../../interfaces/probe-type';
import { ProbeTypesService } from '../../services/probe-types.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-probe-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-type-form.component.html',
  styleUrl: './probe-type-form.component.scss'
})
export class ProbeTypeFormComponent implements OnInit, DoCheck {
  @Input() readOnly: boolean = false;
  saveMessage: string | null = null;
  saveError = false;
  originalProbeType: ProbeType | null = null;
  showDeleteModal = false;

  private lastSelectedProbeType: ProbeType | null = null;
  private lastIsNew = false;
  private preserveMessageOnNextSync = false;

  constructor(public measurementProbeTypesService: ProbeTypesService, private alerts: AlertService) {}

  ngOnInit(): void {
    this.syncWithSelection(false);
  }

  ngDoCheck(): void {
    const current = this.measurementProbeTypesService.selectedElementCopy;
    const isNew = this.measurementProbeTypesService.selectedElementIsNew;

    if (current !== this.lastSelectedProbeType || isNew !== this.lastIsNew) {
      this.syncWithSelection(this.preserveMessageOnNextSync);
      this.preserveMessageOnNextSync = false;
    }
  }

  get selectedProbeType(): ProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  get isNew(): boolean {
    return this.measurementProbeTypesService.selectedElementIsNew;
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

    const requiredFields: Array<keyof ProbeType> = ['name', 'hoehe', 'breite', 'windungszahl'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (form.invalid || invalidFields.length > 0) {
      this.alerts.error('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    try {
      if (this.selectedProbeType.notiz === null) {
        this.selectedProbeType.notiz = '';
      }

      await this.measurementProbeTypesService.updateOrCreateElement(this.selectedProbeType);

      if (this.selectedProbeType.id != null) {
        this.preserveMessageOnNextSync = true;
        await this.measurementProbeTypesService.selectElement(this.selectedProbeType.id);
      }

      this.alerts.success('Änderungen gespeichert!');

      this.saveError = false;
      this.originalProbeType = this.selectedProbeType ? { ...this.selectedProbeType } : null;
      form.form.markAsPristine();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      this.alerts.error('Fehler beim Speichern!', error);
    }
  }

  isFieldInvalid(field: keyof ProbeType): boolean {
    const current = this.selectedProbeType;
    if (!current) {
      return false;
    }

    const value = current[field];

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
    this.backToListing();
  }

  backToListing(): void {
    this.measurementProbeTypesService.selectedElementCopy = null;
    this.measurementProbeTypesService.selectedElementIsNew = false;
    this.originalProbeType = null;
    this.saveMessage = null;
    this.saveError = false;
  }

  private syncWithSelection(preserveMessage: boolean): void {
    const current = this.measurementProbeTypesService.selectedElementCopy;

    this.lastSelectedProbeType = current ?? null;
    this.lastIsNew = this.measurementProbeTypesService.selectedElementIsNew;
    this.originalProbeType = current ? { ...current } : null;
    this.saveError = false;
    this.showDeleteModal = false;

    if (!preserveMessage) {
      this.saveMessage = null;
    }
  }
}
