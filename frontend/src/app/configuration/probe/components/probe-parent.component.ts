import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProbeListComponent } from './list/probe-list.component';
import { ProbeManagementComponent } from './management/probe-management.component';
import { ProbesService } from '../services/probes.service';

@Component({
  selector: 'app-probe-parent',
  standalone: true,
  imports: [CommonModule, ProbeListComponent, ProbeManagementComponent],
  templateUrl: './probe-parent.component.html',
  styleUrl: './probe-parent.component.scss'
})
export class ProbeParentComponent {
  constructor(public probesService:ProbesService) {}
}
