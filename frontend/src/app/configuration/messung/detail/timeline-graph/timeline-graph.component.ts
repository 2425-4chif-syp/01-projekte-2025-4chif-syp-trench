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
  // Geometry inputs
  @Input() innerWidth: number = 100;
  @Input() innerHeight: number = 30;
  @Input() insetX: number = 1;
  @Input() insetY: number = 7;
  @Input() outerViewBoxWidth: number = 102;
  @Input() outerViewBoxHeight: number = 40;

  @Output() valueChange = new EventEmitter<number>();
  private pointerDown = false;

  private clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
  }

  private computeValueFromEvent(ev: PointerEvent, svgEl: SVGSVGElement): number | null {
    if (this.sliderMinMs === null || this.sliderMaxMs === null) return null;
    // Prefer mapping relative to background rect for exact inner bounds
    const bg = svgEl.querySelector('.bg-rect') as SVGGraphicsElement | null;
    const rect = (bg?.getBoundingClientRect()) || svgEl.getBoundingClientRect();
    const width = rect.width;
    const x = this.clamp(ev.clientX - rect.left, 0, width);
    const t = width > 0 ? x / width : 0; // 0..1 across inner rect
    const val = Math.round(this.sliderMinMs + t * (this.sliderMaxMs - this.sliderMinMs));
    return val;
  }

  public onPointerDown(ev: PointerEvent): void {
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (!svg) return;
    try { svg.setPointerCapture?.(ev.pointerId); } catch {}
    this.pointerDown = true;
    const v = this.computeValueFromEvent(ev, svg);
    if (v !== null) this.valueChange.emit(v);
  }

  public onPointerMove(ev: PointerEvent): void {
    if (!this.pointerDown) return;
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (!svg) return;
    const v = this.computeValueFromEvent(ev, svg);
    if (v !== null) this.valueChange.emit(v);
  }

  public onPointerUp(ev: PointerEvent): void {
    const svg = ev.currentTarget as SVGSVGElement | null;
    if (svg) {
      try { svg.releasePointerCapture?.(ev.pointerId); } catch {}
    }
    this.pointerDown = false;
  }

  public lineXNormalized(): number {
    if (this.sliderMinMs === null || this.sliderMaxMs === null || this.value === null) return 0;
    const range = (this.sliderMaxMs - this.sliderMinMs) || 1;
    const t = (this.value - this.sliderMinMs) / range;
    return this.clamp(t, 0, 1);
  }
}
