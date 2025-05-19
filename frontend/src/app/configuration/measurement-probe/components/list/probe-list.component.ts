import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbesService } from '../../services/probes.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Probe } from '../../interfaces/probe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-probe-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: ProbesService
    }
  ],
  templateUrl: './probe-list.component.html',
  styleUrl: './probe-list.component.scss'
})
export class ProbeListComponent {

  public get isProbeSelector(): boolean {
    return this.probesService.isProbeSelector;
  }

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Spule',
    'name': 'Name',
    'probeType': 'Sondentyp',
    'kalibrierungsfaktor': 'Kalibrierungsfaktor'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Probe) => string } = {
    'probeType': (element:Probe) => element.probeType?.name ?? `Unnamed ProbeType (ID ${element.probeTypeId})`
  }

  constructor(public probesService:ProbesService, private router:Router) {

  }

  openProbe(probe:Probe) {
    const probeId = probe.id!;

    if (this.probesService.isProbeSelector) {
      
    }

    this.probesService.selectElement(probeId);
  }
}
