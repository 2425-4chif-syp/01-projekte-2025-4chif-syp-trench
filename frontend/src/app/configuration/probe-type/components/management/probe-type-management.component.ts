import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ProbeTypesService } from '../../services/probe-types.service';
import { ProbeType } from '../../interfaces/probe-type';
import { ProbeTypeFormComponent } from '../form/probe-type-form.component';
import { ProbeTypeVisualizationComponent } from '../visualization/probe-type-visualization.component';
import { FormsModule } from '@angular/forms';
import { ModeService } from '../../../../services/mode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-probe-type-management',
  standalone: true,
  imports: [CommonModule, ProbeTypeFormComponent, ProbeTypeVisualizationComponent, FormsModule],
  templateUrl: './probe-type-management.component.html',
  styleUrls: ['./probe-type-management.component.scss']
})
export class ProbeTypeManagementComponent implements OnInit, OnDestroy {
  @Input() readOnly: boolean = false;
  private modeSubscription?: Subscription;

  saveMessage: string | null = null;
  saveError: boolean = false;
  originalProbeType: ProbeType | null = null;
  showDeleteModal = false;

  constructor(
    public measurementProbeTypesService: ProbeTypesService,
    public modeService: ModeService
  ) {}

  ngOnInit() {
    if (this.selectedProbeType) {
      this.originalProbeType = { ...this.selectedProbeType };
    }

    // Subscribe to mode changes
    this.modeSubscription = this.modeService.currentMode$.subscribe(() => {
      this.readOnly = this.modeService.isMonteurMode();
    });
  }

  ngOnDestroy() {
    if (this.modeSubscription) {
      this.modeSubscription.unsubscribe();
    }
  }

  public get selectedProbeType(): ProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  get selectedProbeTypeId(): number | undefined {
    return this.measurementProbeTypesService.selectedElementCopy?.id ?? undefined;
  }

  async onProbeTypeSelectionChange(probeTypeId: number): Promise<void> {
    const numericId = Number(probeTypeId);
    await this.measurementProbeTypesService.selectElement(numericId);
  }

  hasChanges(): boolean {
    if (!this.selectedProbeType || !this.originalProbeType) return false;
    return JSON.stringify(this.selectedProbeType) !== JSON.stringify(this.originalProbeType);
  }

  saveChanges() {
    // Beispiel-Methode, ggf. durch Service implementieren
    if (!this.readOnly && this.selectedProbeType) {
      this.measurementProbeTypesService.saveElement(this.selectedProbeType).then(() => {
        this.saveMessage = 'Messsonde erfolgreich gespeichert';
        this.originalProbeType = { ...this.selectedProbeType };
        this.saveError = false;
      }).catch(() => {
        this.saveError = true;
        this.saveMessage = null;
      });
    }
  }

  backToListing() {
    // Navigation zurück zur Übersicht implementieren
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  deleteProbeType() {
    if (!this.readOnly && this.selectedProbeType) {
      this.measurementProbeTypesService.deleteElement(this.selectedProbeType.id).then(() => {
        this.showDeleteModal = false;
        this.saveMessage = 'Messsonde gelöscht';
      });
    }
  }

  isFieldInvalid(field: keyof ProbeType): boolean {
    if (!this.selectedProbeType) return false;
    const value = this.selectedProbeType[field];
    return value === null || value === undefined || value === '';
  }
}
