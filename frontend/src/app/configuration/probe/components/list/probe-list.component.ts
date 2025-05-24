import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProbesService } from '../../services/probes.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Probe } from '../../interfaces/probe';
import { Router } from '@angular/router';
import { ProbeTypesService } from '../../../probe-type/services/probe-types.service';
import { ProbePositionService } from '../../../probe-position/services/probe-position.service';

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

  constructor(public probesService:ProbesService, private probePositionService: ProbePositionService, private router:Router) {

  }

  openProbe(probe:Probe) {
    const probeId = probe.id!;

    if (this.probesService.isProbeSelector) {
      console.log(`Probe selected: ${probeId}`);

      const probePosition = this.probePositionService.selectedElementCopy;
      let tmp = this.probePositionService.newElement;
      tmp.id = 1;
      tmp.measurementProbeId = probeId;
      tmp.measurementProbe = probe;
      tmp.measurementSettingsId = probePosition?.measurementSettingsId ?? 0;
      tmp.measurementSetting = probePosition?.measurementSetting ?? null;
      tmp.schenkel = probePosition?.schenkel ?? 0;
      tmp.position = probePosition?.position ?? 0;

      this.probePositionService.updateOrCreateElement(tmp);

      this.probesService.isProbeSelector = false;
      this.router.navigate(['/measurement-settings-list']);
      return;
    }

    this.probesService.selectElement(probeId);
  }
}
