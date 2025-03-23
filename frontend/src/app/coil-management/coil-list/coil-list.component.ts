import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';
import { BackendService } from '../../backend.service';
import { GenericListComponent } from '../../generic-list/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../data/list-service';

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
  public hoveredCoiltype: Coil | null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'Spule',
    'coiltypeId': 'Spulentyp',
    'auftragsnummer': 'AuftragsNr',
    'auftragsPosNr': 'AuftragsPosNr',
    'ur': 'UR',
    'einheit': 'Einheit',
    'omega': 'Omega'
  }

  constructor(public coilsService:CoilsService) {

  }

  openCoil(coilId: number) {
    this.coilsService.selectElement(coilId);
  }
}
