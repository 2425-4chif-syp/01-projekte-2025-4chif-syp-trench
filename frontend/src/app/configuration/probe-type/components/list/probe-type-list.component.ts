import { Component } from '@angular/core';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { ProbeTypesService as ProbeTypesService } from '../../services/probe-types.service';
import {Router} from "@angular/router";
import { ProbeType } from '../../interfaces/probe-type';
import { ProbesService } from '../../../probe/services/probes.service';

@Component({
  selector: 'app-probe-type-list',
  standalone: true,
  imports: [GenericListComponent],
    providers: [
      {
        provide: LIST_SERVICE_TOKEN,
        useExisting: ProbeTypesService
      }
    ],
  templateUrl: './probe-type-list.component.html',
  styleUrl: './probe-type-list.component.scss'
})
export class ProbeTypeListComponent {
    public hoveredProbeType: ProbeType | null = null;
    public mousePosition: { x: number, y: number }|null = null;

    public readonly keysAsColumns: { [key: string]: string } = {
      'id': 'Messsondentyp',
      'name': 'Name',
      'breite': 'Breite',
      'hoehe': 'Höhe',
      'windungszahl': 'Windungszahl',
      'notiz': 'Notiz'
    }
    public readonly elementValueToStringMethods: { [key: string]: (element:ProbeType) => string } = {

    }

    constructor(public measurementProbeTypesService:ProbeTypesService, public probesService: ProbesService, public router: Router) {

    }

    public get isProbeSelector(): boolean {
      return this.measurementProbeTypesService.isProbeSelector;
    }

    openProbeType(probeType:ProbeType) {
      const id:number = probeType.id!;

      if (this.measurementProbeTypesService.isProbeSelector) {
        this.probesService.selectedElementCopy!.probeTypeId = id;
        this.probesService.selectedElementCopy!.probeType = this.measurementProbeTypesService.getCopyElement(id);

        this.router.navigate(['/probe-management']);
        return;
      }

      this.measurementProbeTypesService.selectElement(id);
    }
}
