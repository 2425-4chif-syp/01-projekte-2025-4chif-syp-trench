import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProbeTypesService } from '../../services/probe-types.service';
import { ProbeType } from '../../interfaces/probe-type';

@Component({
  selector: 'app-probe-type-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-type-management.component.html',
  styleUrl: './probe-type-management.component.scss'
})
export class ProbeTypeManagementComponent implements OnInit {
  saveMessage: string | null = null;
  saveError: boolean = false;
  originalProbeType: ProbeType | null = null;
  showDeleteModal = false;

  constructor(private measurementProbeTypesService: ProbeTypesService) {}

  ngOnInit() {
    if (this.selectedProbeType) {
      this.originalProbeType = { ...this.selectedProbeType };
    }
  }

  public get selectedProbeType(): ProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  hasChanges(): boolean {
    if (!this.originalProbeType || !this.selectedProbeType) return false;
    return JSON.stringify(this.originalProbeType) !== JSON.stringify(this.selectedProbeType);
  }

  async saveChanges() {
    if (!this.selectedProbeType) return;

    this.saveError = true;

    const requiredFields = ['hoehe', 'breite', 'windungszahl'];
    const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    if (invalidFields.length > 0) {
      this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
      return;
    }

    try {
      if(this.selectedProbeType.notiz === null) this.selectedProbeType.notiz = "";
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
    let value = this.selectedProbeType[field as keyof ProbeType];
    return value === null || value === undefined || (typeof value === 'number' && value <= 0);
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }
  
  async confirmDeleteProbeType(): Promise<void> {
    this.showDeleteModal = false;
  
    if (this.selectedProbeType === null) return;
  
    await this.measurementProbeTypesService.deleteElement(this.selectedProbeType.id!);
    this.backToListing();
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