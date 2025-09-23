import { Component } from '@angular/core';
import { ProbeTypesService } from '../services/probe-types.service';
import { ProbeTypeListComponent } from './list/probe-type-list.component';
import { ProbeTypeManagementComponent } from './management/probe-type-management.component';
import { ModeService } from '../../../services/mode.service';
@Component({
  selector: 'app-probe-type-parent',
  standalone: true,
  imports: [ProbeTypeListComponent, ProbeTypeManagementComponent],
  templateUrl: './probe-type-parent.component.html',
  styleUrl: './probe-type-parent.component.scss'
})
export class ProbeTypeParentComponent {
  constructor(
    public measurementProbeTypesService: ProbeTypesService,
    public modeService: ModeService
  ) {}
}
