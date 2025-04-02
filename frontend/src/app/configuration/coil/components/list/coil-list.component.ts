import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../services/coils.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { Coil } from '../../interfaces/coil';

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

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Spule',
    'coiltype': 'Spulentyp',
    'auftragsnummer': 'AuftragsNr',
    'auftragsPosNr': 'AuftragsPosNr',
    'ur': 'UR',
    'einheit': 'Einheit',
    'omega': 'Omega'
  }
  public readonly elementValueToStringMethods: { [key: string]: (element:Coil) => string } = {
    'coiltype': (element:Coil) => element.coiltype?.name ?? `Unnamed Coil (ID ${element.coiltypeId})`
  }

  constructor(public coilsService:CoilsService) {

  }

  openCoil(coil:Coil) {
    const coilId = coil.id!;
    this.coilsService.selectElement(coilId);
  }
}
