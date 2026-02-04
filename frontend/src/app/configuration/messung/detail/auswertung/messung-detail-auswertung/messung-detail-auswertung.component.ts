import { Component, Input, signal } from '@angular/core';
import { ProbeType } from '../../../../probe-type/interfaces/probe-type';
import { Probe } from '../../../../probe/interfaces/probe';
import { Coil } from '../../../../coil/interfaces/coil';
import { Coiltype } from '../../../../coiltype/interfaces/coiltype';
import { MeasurementSetting } from '../../../../measurement-settings/interfaces/measurement-settings';
import { DisplacementVisualizationComponent } from '../../../../../visualization/displacement/components/displacement-visualization.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-messung-detail-auswertung',
  standalone: true,
  imports: [DisplacementVisualizationComponent, DecimalPipe, CommonModule],
  templateUrl: './messung-detail-auswertung.component.html',
  styleUrl: './messung-detail-auswertung.component.scss'
})
export class MessungDetailAuswertungComponent {
    @Input() yokes = signal<{ sensors: (number | null)[] }[]>([]);
    @Input() yokeData = signal<{ x: number; y: number }[][]>([]);
    @Input() m_tot = signal<number>(0);
    @Input() probeType:ProbeType = null!;
    @Input() probes:Probe[] = [];
    @Input() coil:Coil = null!;
    @Input() coiltype:Coiltype = null!;
    @Input() measurementSetting:MeasurementSetting = null!;
    @Input() grafanaPanelUrls: Map<number, SafeResourceUrl> | null = null;

    public get isWithinTolerance(): boolean {
      return this.m_tot() < this.coiltype!.toleranzbereich!;
    }
}
