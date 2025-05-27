import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbesService } from '../../services/probes.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Probe } from '../../interfaces/probe';
import { Router } from '@angular/router';
import { ProbePositionService } from '../../../probe-position/services/probe-position.service';

@Component({
  selector: 'app-probe-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    { provide: LIST_SERVICE_TOKEN, useExisting: ProbesService }
  ],
  templateUrl: './probe-list.component.html',
  styleUrl:    './probe-list.component.scss'
})
export class ProbeListComponent {
  get isProbeSelector(): boolean {
    return this.probesService.isProbeSelector;
  }

  readonly keysAsColumns: { [key: string]: string } = {
    id: 'Spule',
    name: 'Name',
    probeType: 'Sondentyp',
    kalibrierungsfaktor: 'Kalibrierungsfaktor'
  };

  readonly elementValueToStringMethods = {
    probeType: (e: Probe) => e.probeType?.name ?? `Unnamed ProbeType (ID ${e.probeTypeId})`
  };

  constructor(
    public  probesService:      ProbesService,
    private probePositionService: ProbePositionService,
    private router:             Router
  ) {}


  openProbe(probe: Probe): void {

    if (this.probesService.isProbeSelector) {

      const pos = this.probePositionService.selectedElementCopy!;
      pos.measurementProbeId  = probe.id;
      pos.measurementProbe    = probe;

      this.probePositionService.updateOrCreateElement(pos);

      this.probesService.isProbeSelector = false;
      this.router.navigate(['/measurement-settings-list']);
      return;
    }

    this.probesService.selectElement(probe.id!);
  }
}
