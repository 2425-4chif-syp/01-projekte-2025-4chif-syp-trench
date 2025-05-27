import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../services/coils.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Coil } from '../../interfaces/coil';
import { Router } from '@angular/router';
import { MeasurementSettingsService } from '../../../measurement-settings/services/measurement-settings.service';

@Component({
  selector: 'app-coil-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: CoilsService
    }
  ],
  templateUrl: './coil-list.component.html',
  styleUrl: './coil-list.component.scss'
})
export class CoilListComponent {
  public hoveredCoil: Coil | null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public get isCoilSelector(): boolean {
    return this.coilsService.isCoilSelector;
  }

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Spule',
    'coiltype': 'Spulentyp',
    'auftragsnummer': 'AuftragsNr',
    'auftragsPosNr': 'AuftragsPosNr',
    'einheit': 'Einheit',
    'bemessungsspannung': 'Bemessungsspannung',
    'bemessungsfrequenz': 'Bemessungsfrequenz'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Coil) => string } = {
    'coiltype': (element:Coil) => element.coiltype?.name ?? `Unnamed Coil (ID ${element.coiltypeId})`
  }

  constructor(public coilsService:CoilsService, public measurementSettingsService:MeasurementSettingsService, private router:Router) {

  }

  openCoil(coil:Coil) {
    const coilId = coil.id!;

    if (this.coilsService.isCoilSelector) {
      console.log(this.measurementSettingsService.selectedElementCopy ?? "undefined 1");

      this.measurementSettingsService.selectedElementCopy!.coilId = coilId;
      console.log(this.measurementSettingsService.selectedElementCopy ?? "undefined");
      this.measurementSettingsService.selectedElementCopy!.coil = this.coilsService.getCopyElement(coilId);
      console.log("Test");

      this.router.navigate(['/measurement-settings-list']);
      return;
    }

    this.coilsService.selectElement(coilId);
  }
}
