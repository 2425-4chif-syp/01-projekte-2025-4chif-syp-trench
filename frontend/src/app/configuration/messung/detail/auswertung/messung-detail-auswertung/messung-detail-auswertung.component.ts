import { Component, Input, signal, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
export class MessungDetailAuswertungComponent implements OnChanges, OnDestroy {
    @Input() yokes = signal<{ sensors: (number | null)[] }[]>([]);
    @Input() yokeData = signal<{ x: number; y: number }[][]>([]);
    @Input() m_tot = signal<number>(0);
    @Input() probeType:ProbeType = null!;
    @Input() probes:Probe[] = [];
    @Input() coil:Coil = null!;
    @Input() coiltype:Coiltype = null!;
    @Input() measurementSetting:MeasurementSetting = null!;
    @Input() grafanaPanelUrls: Map<number, SafeResourceUrl> | null = null;

    /**
     * Panels staged in the DOM (hidden) – added one by one with a delay
     * so the browser doesn't saturate its per-host connection limit.
     */
    stagedPanels: { schenkel: number; url: SafeResourceUrl }[] = [];
    /** Flips to true once every panel iframe is in the DOM → makes them all visible at once */
    allReady = false;
    private staggerTimers: any[] = [];

    public get isWithinTolerance(): boolean {
      return this.m_tot() < this.coiltype!.toleranzbereich!;
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['grafanaPanelUrls']) {
        this.staggerIframes();
      }
    }

    ngOnDestroy(): void {
      this.staggerTimers.forEach(t => clearTimeout(t));
    }

    /**
     * Add iframes to the DOM one-by-one with a delay so each gets the
     * browser's full connection budget (6 per hostname on HTTP/1.1).
     * Once the last iframe is staged we flip `allReady` so all panels
     * become visible simultaneously.
     */
    private staggerIframes(): void {
      this.staggerTimers.forEach(t => clearTimeout(t));
      this.staggerTimers = [];
      this.stagedPanels = [];
      this.allReady = false;

      if (!this.grafanaPanelUrls || this.grafanaPanelUrls.size === 0) return;

      const allPanels = Array.from(this.grafanaPanelUrls.entries())
        .map(([schenkel, url]) => ({ schenkel, url }));

      const DELAY_MS = 1500;
      allPanels.forEach((panel, i) => {
        const timer = setTimeout(() => {
          this.stagedPanels = [...this.stagedPanels, panel];
          // Once the last panel is staged, reveal them all
          if (this.stagedPanels.length === allPanels.length) {
            this.allReady = true;
          }
        }, i * DELAY_MS);
        this.staggerTimers.push(timer);
      });
    }
}
