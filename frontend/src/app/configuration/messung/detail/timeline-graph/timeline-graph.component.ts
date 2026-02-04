import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-graph.component.html',
  styleUrl: './timeline-graph.component.scss'
})
export class TimelineGraphComponent {
  @Input() sliderMinMs: number | null = null;
  @Input() sliderMaxMs: number | null = null;
  @Input() value: number | null = null;
  @Input() mTotSeries: number[][] = [];
  @Input() allSensorsSentMs: number | null = null;
  @Input() tolerance: number | null = null;
  // Geometry inputs
  @Input() innerWidth: number = 100;
  @Input() innerHeight: number = 20;
  @Input() insetX: number = 1;
  @Input() insetY: number = 3;
  @Input() outerViewBoxWidth: number = 102;
  @Input() outerViewBoxHeight: number = 22;

  @Output() valueChange = new EventEmitter<number>();
  public pointerDown = false;
  public hoverValue: number | null = null;
  private dragNormalized: number | null = null; // 0..1 while dragging
  // Zoom state
  public selectingZoom = false;
  private selectionFirstMs: number | null = null;
  private selectionStartMs: number | null = null;
  private selectionEndMs: number | null = null;
  public zoomStack: { min: number; max: number }[] = [];

  // Computed viewBox ensures inner drawing area plus margins fits without clipping
  public get viewBoxWidth(): number {
    return Math.max(this.outerViewBoxWidth, this.insetX + this.innerWidth + 2);
  }
  public get viewBoxHeight(): number {
    return Math.max(this.outerViewBoxHeight, this.insetY + this.innerHeight + 2);
  }

  public get trimmedMTotSeries(): number[][] { 
    // mTotSeries should start at allSensorsSentMs 
    if (this.allSensorsSentMs === null) 
      return this.mTotSeries;

    return this.mTotSeries.filter(entry => entry[0] >= this.allSensorsSentMs!);
  }

  public get baseMinMs(): number | null {
    return this.sliderMinMs;
  }
  public get baseMaxMs(): number | null {
    return this.sliderMaxMs;
  }
  public get effectiveMinMs(): number | null {
    if (this.zoomStack.length > 0) return this.zoomStack[this.zoomStack.length - 1].min;
    return this.sliderMinMs;
  }
  public get effectiveMaxMs(): number | null {
    if (this.zoomStack.length > 0) return this.zoomStack[this.zoomStack.length - 1].max;
    return this.sliderMaxMs;
  }

  public get graphLineSegments(): { time1: number; m_tot1: number; time2: number; m_tot2: number }[] {
    // End with the value again
    const endTime = (this.effectiveMaxMs ?? this.sliderMaxMs ?? 0);
    const mTotSeriesFull = [...this.trimmedMTotSeries];
    mTotSeriesFull.push([endTime, this.trimmedMTotSeries.length > 0 ? this.trimmedMTotSeries[this.trimmedMTotSeries.length - 1][1] : 0]);

    // Create horizontal segments, then clip to effective range
    const segments = mTotSeriesFull
      .slice(0, -1)
      .map((time_value_group, index) => ({
        time1: time_value_group[0],
        m_tot1: time_value_group[1], 
        time2: mTotSeriesFull[index + 1][0],
        m_tot2: time_value_group[1]
      }));
    const minT = this.effectiveMinMs ?? this.sliderMinMs ?? 0;
    const maxT = this.effectiveMaxMs ?? this.sliderMaxMs ?? 0;
    return segments.filter(s => s.time2 >= minT && s.time1 <= maxT);
  }
  
  // Scales line segments to fit within the inner drawing area
  public get scaledLineSegments(): { x1: number; y1: number; x2: number; y2: number }[] {
    const minT = this.effectiveMinMs ?? this.sliderMinMs ?? 0;
    const maxT = this.effectiveMaxMs ?? this.sliderMaxMs ?? 1;
    const denom = (maxT - minT) || 1;
    const maxY = Math.max(...this.trimmedMTotSeries.map(v => v[1]), 1);
    return this.graphLineSegments.map(segment => ({
      x1: ((segment.time1 - minT) / denom) * this.innerWidth,
      y1: this.innerHeight - ((segment.m_tot1 / maxY) * this.innerHeight),
      x2: ((segment.time2 - minT) / denom) * this.innerWidth,
      y2: this.innerHeight - ((segment.m_tot2 / maxY) * this.innerHeight)
    }));
  }
  public get scaledTolerance(): number {
    if (this.tolerance === null) return 0;
    return this.innerHeight - ((this.tolerance /  Math.max(...this.trimmedMTotSeries.map(v => v[1]), 1)) * this.innerHeight);
  }

  public min(a: number, b: number): number {
    return Math.min(a, b);
  }
  public max(a: number, b: number): number {
    return Math.max(a, b);
  }
  private clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
  }

  private computeNormalizedFromEvent(ev: PointerEvent, svgEl: SVGSVGElement): number | null {
    if (this.sliderMinMs === null || this.sliderMaxMs === null) return null;
    const svgRect = svgEl.getBoundingClientRect();
    const vbW = this.viewBoxWidth;
    const vbH = this.viewBoxHeight;
    // Map client coordinates to SVG viewBox coordinates accounting for preserveAspectRatio="meet"
    const scale = Math.min(svgRect.width / vbW, svgRect.height / vbH);
    const offsetX = (svgRect.width - vbW * scale) / 2;
    const xClient = ev.clientX - svgRect.left - offsetX;
    const xVb = xClient / scale; // in outer viewBox units
    // Constrain to inner drawing area [insetX, insetX + innerWidth]
    const innerStart = this.insetX;
    const innerEnd = this.insetX + this.innerWidth;
    const t = (xVb - innerStart) / (innerEnd - innerStart);
    return this.clamp(t, 0, 1);
  }

  private computeValueFromEvent(ev: PointerEvent, svgEl: SVGSVGElement): number | null {
    const t = this.computeNormalizedFromEvent(ev, svgEl);
    const minT = this.effectiveMinMs;
    const maxT = this.effectiveMaxMs;
    if (t === null || minT === null || maxT === null) return null;
    const val = minT + t * (maxT - minT);
    return val;
  }

  public onPointerDown(ev: PointerEvent): void {
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (!svg) return;
    try { svg.setPointerCapture?.(ev.pointerId); } catch {}
    this.pointerDown = true;
    // Track exact normalized position for rendering
    const t = this.computeNormalizedFromEvent(ev, svg);
    this.dragNormalized = t;
    const v = this.computeValueFromEvent(ev, svg);
    if (this.selectingZoom) {
      // Begin selection by drag or click
      this.selectionStartMs = v;
      this.selectionEndMs = v;
      return;
    }
    if (v !== null) this.valueChange.emit(v);
  }

  public onPointerMove(ev: PointerEvent): void {
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (!svg) return;
    // Always update hover value on move
    const hover = this.computeValueFromEvent(ev, svg);
    const t = this.computeNormalizedFromEvent(ev, svg);
    if (this.pointerDown) this.dragNormalized = t;
    this.hoverValue = hover;
    // Zoom selection: update end while dragging, do not emit value changes
    if (this.selectingZoom) {
      if (this.pointerDown) this.selectionEndMs = hover;
      return;
    }
    // Only emit when actively dragging (normal mode)
    if (!this.pointerDown) return;
    if (hover !== null) this.valueChange.emit(hover);
  }

  public onPointerUp(ev: PointerEvent): void {
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (svg) {
      try { svg.releasePointerCapture?.(ev.pointerId); } catch {}
    }
    // Finalize zoom selection on pointer up
    if (this.selectingZoom) {
      const v = svg ? this.computeValueFromEvent(ev, svg) : null;
      const start = this.selectionStartMs ?? v;
      const end = this.selectionEndMs ?? v;
      if (start !== null && end !== null && start !== end) {
        this.finalizeZoom(start, end);
      } else {
        // Click-based selection: store first or finalize second
        if (this.selectionFirstMs === null && v !== null) {
          this.selectionFirstMs = v;
        } else if (this.selectionFirstMs !== null && v !== null) {
          this.finalizeZoom(this.selectionFirstMs, v);
        }
      }
    }
    this.pointerDown = false;
    this.hoverValue = null;
    this.dragNormalized = null;
    // Reset transient drag selection markers
    this.selectionStartMs = null;
    this.selectionEndMs = null;
  }

  public lineXNormalized(): number {
    const minT = this.effectiveMinMs;
    const maxT = this.effectiveMaxMs;
    if (minT === null || maxT === null || this.value === null) return 0;
    const range = (maxT - minT) || 1;
    const t = (this.value - minT) / range;
    return this.clamp(t, 0, 1);
  }

  public lineXActiveNormalized(): number {
    if (this.pointerDown && this.dragNormalized !== null) {
      return this.clamp(this.dragNormalized, 0, 1);
    }
    return this.lineXNormalized();
  }

  public lineXHoverNormalized(): number {
    const minT = this.effectiveMinMs;
    const maxT = this.effectiveMaxMs;
    if (minT === null || maxT === null || this.hoverValue === null) return 0;
    const range = (maxT - minT) || 1;
    const t = (this.hoverValue - minT) / range;
    return this.clamp(t, 0, 1);
  }

  // Selection helpers for overlay rendering
  public selectionStartNormalized(): number | null {
    const minT = this.effectiveMinMs;
    const maxT = this.effectiveMaxMs;
    if (minT === null || maxT === null || this.selectionStartMs === null) return null;
    const range = (maxT - minT) || 1;
    return this.clamp((this.selectionStartMs - minT) / range, 0, 1);
  }
  public selectionEndNormalized(): number | null {
    const minT = this.effectiveMinMs;
    const maxT = this.effectiveMaxMs;
    if (minT === null || maxT === null || this.selectionEndMs === null) return null;
    const range = (maxT - minT) || 1;
    return this.clamp((this.selectionEndMs - minT) / range, 0, 1);
  }
  public selectionStartNormalizedSafe(): number {
    return this.selectionStartNormalized() ?? 0;
  }
  public selectionEndNormalizedSafe(): number {
    return this.selectionEndNormalized() ?? 0;
  }
  public abs(n: number): number { return Math.abs(n); }

  // Zoom control
  public startZoomSelection(): void {
    if (this.effectiveMinMs === null || this.effectiveMaxMs === null) return;
    this.selectingZoom = true;
    this.selectionFirstMs = null;
    this.selectionStartMs = null;
    this.selectionEndMs = null;
  }

  public resetZoom(): void {
    this.zoomStack = [];
    this.selectingZoom = false;
    this.selectionFirstMs = null;
    this.selectionStartMs = null;
    this.selectionEndMs = null;
  }

  private finalizeZoom(a: number, b: number): void {
    const baseMin = this.baseMinMs;
    const baseMax = this.baseMaxMs;
    if (baseMin === null || baseMax === null) return;
    let minSel = Math.min(a, b);
    let maxSel = Math.max(a, b);
    // Ensure selection within base bounds
    minSel = this.clamp(minSel, baseMin, baseMax);
    maxSel = this.clamp(maxSel, baseMin, baseMax);
    let range = Math.max(maxSel - minSel, 1);
    const pad = range * 0.05; // 5% padding
    let newMin = this.clamp(minSel - pad, baseMin, baseMax);
    let newMax = this.clamp(maxSel + pad, baseMin, baseMax);
    if (newMax - newMin < 1) {
      newMax = this.clamp(newMin + 1, baseMin, baseMax);
    }
    this.zoomStack.push({ min: newMin, max: newMax });
    // Clear selection state
    this.selectingZoom = false;
    this.selectionFirstMs = null;
    this.selectionStartMs = null;
    this.selectionEndMs = null;
  }
}
