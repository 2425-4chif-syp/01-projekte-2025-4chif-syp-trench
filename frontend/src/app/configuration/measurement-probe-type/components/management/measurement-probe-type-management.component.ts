import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeasurementProbeTypesService } from '../../services/measurement-probe-types.service';

export interface MeasurementProbeType {
  id: number | null;
  breite: number | null;
  hoehe: number | null;
  wicklungszahl: number | null;
  notiz: string | null;
}

@Component({
  selector: 'app-measurement-probe-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-type-management.component.html',
  styleUrl: './measurement-probe-type-management.component.scss'
})
export class MeasurementProbeTypeManagementComponent implements OnInit {
  saveMessage: string | null = null;
  saveError: boolean = false;
  originalProbeType: MeasurementProbeType | null = null;

  constructor(private measurementProbeTypesService: MeasurementProbeTypesService) {}

  ngOnInit() {
    if (this.selectedProbeType) {
      this.originalProbeType = { ...this.selectedProbeType };
    }
  }

  public get selectedProbeType(): MeasurementProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  hasChanges(): boolean {
    if (!this.originalProbeType || !this.selectedProbeType) return false;
    return JSON.stringify(this.originalProbeType) !== JSON.stringify(this.selectedProbeType);
  }

  async saveChanges() {
    if (!this.selectedProbeType) return;

    this.saveError = true;

    const requiredFields = ['hoehe', 'breite', 'wicklungszahl'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
      this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
      return;
    }

    try {
      await this.measurementProbeTypesService.updateOrCreateElement(this.selectedProbeType);
      this.saveMessage = "Änderungen gespeichert!";
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);

      this.saveError = false;
      this.originalProbeType = { ...this.selectedProbeType };
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      this.saveMessage = "Fehler beim Speichern!";
    }
  }

  isFieldInvalid(field: string): boolean {
    if (!this.selectedProbeType) return false;
    let value = this.selectedProbeType[field as keyof MeasurementProbeType];
    return value === null || value === undefined || (typeof value === 'number' && value <= 0);
  }

  async deleteProbeType(): Promise<void> {
    if (this.measurementProbeTypesService.selectedElementCopy === null) {
      return;
    }

    await this.measurementProbeTypesService.deleteElement(this.measurementProbeTypesService.selectedElementCopy.id!);
  }

  backToListing(): void {
    this.measurementProbeTypesService.selectedElementCopy = null;
  }

  get scale(): number {
    return 2; // Factor for scaling the drawing
  }

  get scaledWidth(): number {
    return (this.selectedProbeType?.breite ?? 0) * this.scale;
  }

  get scaledHeight(): number {
    return (this.selectedProbeType?.hoehe ?? 0) * this.scale;
  }
}