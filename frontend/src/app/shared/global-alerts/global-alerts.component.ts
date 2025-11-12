import { Component, OnDestroy, AfterViewInit, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, Alert } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-alerts',
  standalone: true,
  imports: [CommonModule, NgbAlertModule],
  templateUrl: './global-alerts.component.html',
  styleUrl: './global-alerts.component.scss'
})
export class GlobalAlertsComponent implements OnDestroy, AfterViewInit {
  alerts: Alert[] = [];
  private sub: Subscription;
  private expanded = new Set<number>();
  offsetTopPx = 16;
  maxHeightPx = 160;
  private overflowMap = new Map<number, boolean>();

  @ViewChildren('alertContentRef') contentRefs?: QueryList<ElementRef<HTMLElement>>;

  constructor(public alertsService: AlertService) {
    this.sub = this.alertsService.alerts$.subscribe(list => {
      this.alerts = list;
      // Defer overflow calc until DOM updates
      this.deferRecalcOverflow();
    });
  }

  ngAfterViewInit(): void {
    this.recalcOffset();
    this.contentRefs?.changes.subscribe(() => this.deferRecalcOverflow());
    this.deferRecalcOverflow();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(id: number) {
    this.alertsService.close(id);
  }

  toggle(id: number) {
    if (this.expanded.has(id)) this.expanded.delete(id);
    else this.expanded.add(id);
    this.deferRecalcOverflow();
  }

  isExpanded(id: number): boolean {
    return this.expanded.has(id);
  }

  hasOverflow(id: number): boolean {
    return !!this.overflowMap.get(id);
  }

  @HostListener('window:resize')
  onResize() {
    this.recalcOffset();
    this.deferRecalcOverflow();
  }

  private recalcOffset() {
    const nav = document.querySelector('.navbar') as HTMLElement | null;
    if (nav) {
      const h = nav.getBoundingClientRect().height;
      this.offsetTopPx = Math.max(0, Math.round(h + 10));
    } else {
      this.offsetTopPx = 16;
    }
  }

  private deferRecalcOverflow() {
    // schedule twice to cover first and next frame paints
    setTimeout(() => this.recalcOverflow(), 0);
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => this.recalcOverflow());
    }
  }

  private recalcOverflow() {
    const refs = this.contentRefs?.toArray() ?? [];
    for (let i = 0; i < refs.length; i++) {
      const id = this.alerts[i]?.id;
      if (id == null) continue;
      const el = refs[i].nativeElement;
      const has = el.scrollHeight > el.clientHeight + 1;
      this.overflowMap.set(id, has);
    }
  }
}
