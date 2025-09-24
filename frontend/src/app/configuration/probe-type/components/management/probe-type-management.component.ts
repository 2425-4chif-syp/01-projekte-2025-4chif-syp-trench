import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ProbeTypesService } from '../../services/probe-types.service';
import { ProbeType } from '../../interfaces/probe-type';
import { ProbeTypeVisualizationComponent } from '../visualization/probe-type-visualization.component';
import { FormsModule } from '@angular/forms';
import { ModeService } from '../../../../services/mode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-probe-type-management',
  standalone: true,
  imports: [CommonModule, ProbeTypeVisualizationComponent, FormsModule],
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

  async saveChanges() {
    if (!this.readOnly && this.selectedProbeType) {
      try {
        await this.measurementProbeTypesService.updateOrCreateElement(this.selectedProbeType);
        this.saveMessage = 'Messsondentyp erfolgreich gespeichert';
        this.originalProbeType = { ...this.selectedProbeType };
        this.saveError = false;
      } catch (error) {
        this.saveError = true;
        this.saveMessage = 'Fehler beim Speichern';
      }
    }
  }

  backToListing() {
    this.measurementProbeTypesService.selectedElementCopy = null;
    this.originalProbeType = null;
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  async deleteProbeType() {
    if (!this.readOnly && this.selectedProbeType && this.selectedProbeType.id) {
      try {
        await this.measurementProbeTypesService.deleteElement(this.selectedProbeType.id);
        this.showDeleteModal = false;
        this.saveMessage = 'Messsondentyp gelöscht';
        this.measurementProbeTypesService.selectedElementCopy = null;
      } catch (error) {
        this.saveError = true;
        this.saveMessage = 'Fehler beim Löschen';
      }
    }
  }

  isFieldInvalid(field: keyof ProbeType): boolean {
    if (!this.selectedProbeType) return false;
    const value = this.selectedProbeType[field];
    return value === null || value === undefined || value === '';
  }
}
