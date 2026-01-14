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

  @Output() valueChange = new EventEmitter<number>();

  public onInput(ev: Event): void {
    const raw = (ev.target as HTMLInputElement)?.value ?? null;
    const ms = raw !== null ? Number(raw) : NaN;
    if (isNaN(ms)) return;
    this.valueChange.emit(ms);
  }
}
