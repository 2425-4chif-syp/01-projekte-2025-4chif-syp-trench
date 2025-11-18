import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoilListComponent } from './list/coil-list.component';
import { CoilManagementComponent } from './management/coil-management.component';
import { CoilsService } from '../services/coils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coil-parent',
  standalone: true,
  imports: [CommonModule, CoilListComponent, CoilManagementComponent],
  templateUrl: './coil-parent.component.html',
  styleUrl: './coil-parent.component.scss'
})
export class CoilParentComponent implements OnInit {
  constructor(
    public  coilsService: CoilsService,
    private route:        ActivatedRoute
  ) {}

  ngOnInit(): void {
    const selector = this.route.snapshot.queryParamMap.get('selector');

    // Nur im normalen Verwaltungsmodus (kein Selector) Entwurf wiederherstellen
    if (!selector && this.coilsService.selectedElementCopy === null) {
      this.coilsService.loadDraftFromStorage();
    }
  }
}
