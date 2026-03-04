import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-graph.component.html',
  styleUrl: './timeline-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineGraphComponent implements OnChanges {
  @Input() sliderMinMs: number | null = null;
  @Input() sliderMaxMs: number | null = null;
  @Input() value: number | null = null;
  @Input() mTotSeries: number[][] = [];
  @Input() allSensorsSentMs: number | null = null;
  @Input() tolerance: number | null = null;
  // Geometry inputs
  @Input() innerWidth: number = 100;
  @Input() innerHeight: number = 10;
  @Input() insetX: number = 1;
  @Input() insetY: number = 2;
  @Input() outerViewBoxWidth: number = 102;
  @Input() outerViewBoxHeight: number = 14;

  @Output() valueChange = new EventEmitter<number>();

  constructor(private cdr: ChangeDetectorRef) {}

  public pointerDown = false;
  public hoverValue: number | null = null;
  private dragNormalized: number | null = null; // 0..1 while dragging
  // Zoom state
  public selectingZoom = false;
  private selectionFirstMs: number | null = null;
  private selectionStartMs: number | null = null;
  private selectionEndMs: number | null = null;
  public zoomStack: { min: number; max: number }[] = [];

  // === Cached computed values (recalculated only when inputs change) ===
  private _cachedTrimmedSeries: number[][] = [];
  private _cachedMinY: number = 0;
  private _cachedMaxY: number = 1;
  private _cachedScaledSegments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  private _cachedScaledTolerance: number = 0;
  private _segmentsDirty = true;

  ngOnChanges(changes: SimpleChanges): void {
    // Mark segments dirty if any relevant input changed
    if (changes['mTotSeries'] || changes['allSensorsSentMs'] || changes['sliderMinMs'] || 
        changes['sliderMaxMs'] || changes['tolerance'] || changes['innerWidth'] || changes['innerHeight']) {
      this._segmentsDirty = true;
    }
  }

  private recomputeIfDirty(): void {
    if (!this._segmentsDirty) return;
    this._segmentsDirty = false;

    // Trimmed series
    if (this.allSensorsSentMs === null) {
      this._cachedTrimmedSeries = this.mTotSeries;
    } else {
      this._cachedTrimmedSeries = this.mTotSeries.filter(entry => entry[0] >= this.allSensorsSentMs!);
    }

    // Compute min/max Y from data, include tolerance so it stays visible
    let minY = Infinity;
    let maxY = -Infinity;
    for (const entry of this._cachedTrimmedSeries) {
      if (entry[1] < minY) minY = entry[1];
      if (entry[1] > maxY) maxY = entry[1];
    }
    // Include tolerance in range so the tolerance line is always visible
    if (this.tolerance !== null && this.tolerance !== 0) {
      if (this.tolerance < minY) minY = this.tolerance;
      if (this.tolerance > maxY) maxY = this.tolerance;
    }
    // Fallbacks for empty or constant data
    if (!isFinite(minY)) { minY = 0; maxY = 1; }
    if (minY === maxY) { minY -= 0.5; maxY += 0.5; }

    // Add 10% padding so the line doesn't sit right at the edges
    const rangeY = maxY - minY;
    const padding = rangeY * 0.1;
    this._cachedMinY = minY - padding;
    this._cachedMaxY = maxY + padding;

    // Scaled tolerance (mapped into the centered Y range)
    if (this.tolerance === null) {
      this._cachedScaledTolerance = 0;
    } else {
      const yRange = (this._cachedMaxY - this._cachedMinY) || 1;
      this._cachedScaledTolerance = this.innerHeight - (((this.tolerance - this._cachedMinY) / yRange) * this.innerHeight);
    }

    // Line segments (graph + scaled)
    this._cachedScaledSegments = this.computeScaledSegments();
  }

  private computeScaledSegments(): { x1: number; y1: number; x2: number; y2: number }[] {
    const trimmed = this._cachedTrimmedSeries;
    if (trimmed.length === 0) return [];

    const endTime = (this.effectiveMaxMs ?? this.sliderMaxMs ?? 0);
    const minT = this.effectiveMinMs ?? this.sliderMinMs ?? 0;
    const maxT = this.effectiveMaxMs ?? this.sliderMaxMs ?? 1;
    const denom = (maxT - minT) || 1;
    const minY = this._cachedMinY;
    const yRange = (this._cachedMaxY - minY) || 1;
    const iW = this.innerWidth;
    const iH = this.innerHeight;

    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < trimmed.length; i++) {
      const time1 = trimmed[i][0];
      const mTot = trimmed[i][1];
      const time2 = (i + 1 < trimmed.length) ? trimmed[i + 1][0] : endTime;
      
      // Clip to effective range
      if (time2 < minT || time1 > maxT) continue;

      const scaledY = iH - (((mTot - minY) / yRange) * iH);
      result.push({
        x1: ((time1 - minT) / denom) * iW,
        y1: scaledY,
        x2: ((time2 - minT) / denom) * iW,
        y2: scaledY
      });
    }
    return result;
  }

  // Computed viewBox ensures inner drawing area plus margins fits without clipping
  public get viewBoxWidth(): number {
    return Math.max(this.outerViewBoxWidth, this.insetX + this.innerWidth + 2);
  }
  public get viewBoxHeight(): number {
    return Math.max(this.outerViewBoxHeight, this.insetY + this.innerHeight + 2);
  }

  // Public cached accessors used in template
  public get scaledLineSegments(): { x1: number; y1: number; x2: number; y2: number }[] {
    this.recomputeIfDirty();
    return this._cachedScaledSegments;
  }
  public get scaledTolerance(): number {
    this.recomputeIfDirty();
    return this._cachedScaledTolerance;
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
      this.cdr.markForCheck();
      return;
    }
    if (v !== null) this.valueChange.emit(v);
    this.cdr.markForCheck();
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
      this.cdr.markForCheck();
      return;
    }
    // Only emit when actively dragging (normal mode)
    if (!this.pointerDown) {
      this.cdr.markForCheck();
      return;
    }
    if (hover !== null) this.valueChange.emit(hover);
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  public resetZoom(): void {
    this.zoomStack = [];
    this.selectingZoom = false;
    this.selectionFirstMs = null;
    this.selectionStartMs = null;
    this.selectionEndMs = null;
    this._segmentsDirty = true;
    this.cdr.markForCheck();
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
    this._segmentsDirty = true;
    // Clear selection state
    this.selectingZoom = false;
    this.selectionFirstMs = null;
    this.selectionStartMs = null;
    this.selectionEndMs = null;
    this.cdr.markForCheck();
  }
}
