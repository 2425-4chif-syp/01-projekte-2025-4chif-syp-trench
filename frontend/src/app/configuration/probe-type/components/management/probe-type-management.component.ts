import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbeTypesService } from '../../services/probe-types.service';
import { ProbeType } from '../../interfaces/probe-type';
import { ProbeTypeFormComponent } from '../form/probe-type-form.component';
import { ProbeTypeVisualizationComponent } from '../visualization/probe-type-visualization.component';

@Component({
  selector: 'app-probe-type-management',
  standalone: true,
  imports: [CommonModule, ProbeTypeFormComponent, ProbeTypeVisualizationComponent],
  templateUrl: './probe-type-management.component.html',
  styleUrl: './probe-type-management.component.scss'
})
export class ProbeTypeManagementComponent {
  constructor(public measurementProbeTypesService: ProbeTypesService) {}

  get selectedProbeType(): ProbeType | null {
    return this.measurementProbeTypesService.selectedElementCopy;
  }

  get selectedProbeTypeId(): number | undefined {
    return this.measurementProbeTypesService.selectedElementCopy?.id ?? undefined;
  }

  async onProbeTypeSelectionChange(probeTypeId: number): Promise<void> {
    const numericId = Number(probeTypeId);
    await this.measurementProbeTypesService.selectElement(numericId);
  }
}