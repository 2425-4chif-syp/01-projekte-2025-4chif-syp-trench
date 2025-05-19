import { Component } from '@angular/core';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { MeasurementProbeTypesService } from '../../services/measurement-probe-types.service';
import { MeasurementProbeType } from '../../interfaces/measurement-probe-type';
import {MeasurementSettingsService} from "../../../measurement-settings/services/measurement-settings.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-measurement-probe-type-list',
  standalone: true,
  imports: [GenericListComponent],
    providers: [
      {
        provide: LIST_SERVICE_TOKEN,
        useExisting: MeasurementProbeTypesService
      }
    ],
  templateUrl: './measurement-probe-type-list.component.html',
  styleUrl: './measurement-probe-type-list.component.scss'
})
export class MeasurementProbeTypeListComponent {
    public hoveredProbeType: MeasurementProbeType | null = null;
    public mousePosition: { x: number, y: number }|null = null;

    public readonly keysAsColumns: { [key: string]: string } = {
      'id': 'Messsondentyp',
      'name': 'Name',
      'breite': 'Breite',
      'hoehe': 'Höhe',
      'windungszahl': 'Windungszahl',
      'notiz': 'Notiz'
    }
    public readonly elementValueToStringMethods: { [key: string]: (element:MeasurementProbeType) => string } = {

    }

    constructor(public measurementProbeTypesService:MeasurementProbeTypesService, public measurementSettingsService: MeasurementSettingsService, public router: Router) {

    }

    openProbeType(probeType:MeasurementProbeType) {
      const id:number = probeType.id!;

      if (this.measurementProbeTypesService.isProbeSelector) {
        console.log(this.measurementSettingsService.selectedElementCopy ?? "undefined 1");

        this.measurementSettingsService.selectedElementCopy!.measurementProbeTypeId = id;
        console.log(this.measurementSettingsService.selectedElementCopy ?? "undefined");
        this.measurementSettingsService.selectedElementCopy!.measurementProbeType = this.measurementProbeTypesService.getCopyElement(id);
        console.log("Test");

        this.router.navigate(['/measurement-settings-list']);
        return;
      }

      this.measurementProbeTypesService.selectElement(id);
    }
}
