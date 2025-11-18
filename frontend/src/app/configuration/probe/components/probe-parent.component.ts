import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProbeListComponent } from './list/probe-list.component';
import { ProbeManagementComponent } from './management/probe-management.component';
import { ProbesService } from '../services/probes.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-probe-parent',
  standalone: true,
  imports: [CommonModule, ProbeListComponent, ProbeManagementComponent],
  templateUrl: './probe-parent.component.html',
  styleUrl: './probe-parent.component.scss'
})
export class ProbeParentComponent implements OnInit {
  constructor(
    public  probesService: ProbesService,
    private route:         ActivatedRoute
  ) {}

  ngOnInit(): void {
    const selector = this.route.snapshot.queryParamMap.get('selector');

    // Nur im normalen Verwaltungsmodus (kein Selector) Entwurf wiederherstellen
    if (!selector && this.probesService.selectedElementCopy === null) {
      this.probesService.loadDraftFromStorage();
    }
  }
}
