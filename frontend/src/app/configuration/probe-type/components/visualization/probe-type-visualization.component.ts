import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProbeType } from '../../interfaces/probe-type';

@Component({
  selector: 'app-probe-type-visualization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-type-visualization.component.html',
  styleUrl: './probe-type-visualization.component.scss'
})
export class ProbeTypeVisualizationComponent {
  @Input() selectedProbeType: ProbeType | null = null;
  @Input() isNew = false;
  @Input() elements: ProbeType[] = [];
  @Input() selectedProbeTypeId: number | undefined;

  @Output() selectionChange = new EventEmitter<number>();

  private readonly visualizationScale = 2;

  onSelectionChange(probeTypeId: number | null | undefined): void {
    if (probeTypeId == null) {
      return;
    }
    this.selectionChange.emit(Number(probeTypeId));
  }

  get scaledWidth(): number {
    return (this.selectedProbeType?.breite ?? 0) * this.visualizationScale;
  }

  get scaledHeight(): number {
    return (this.selectedProbeType?.hoehe ?? 0) * this.visualizationScale;
  }
}
