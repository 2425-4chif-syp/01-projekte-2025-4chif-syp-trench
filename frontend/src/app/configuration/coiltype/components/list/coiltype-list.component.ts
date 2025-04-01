import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoilVisualizationComponent } from '../../../../visualization/coil/components/coil-visualization.component';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { CoiltypesService } from '../../services/coiltypes.service';
import { Coiltype } from '../../interfaces/coiltype';
import { CoilsService } from '../../../coil/services/coils.service';

@Component({
  selector: 'app-coiltype-list',
  standalone: true,
  imports: [CommonModule, CoilVisualizationComponent, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: CoiltypesService
    }
  ],
  templateUrl: './coiltype-list.component.html',
  styleUrl: './coiltype-list.component.scss'
})
export class CoiltypeListComponent {
  public hoveredCoiltype: Coiltype | null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'ID',
    'name': 'Name',
    'schenkel': 'Schenkelanzahl',
    'bandbreite': 'Bandbreite',
    'schichthoehe': 'Schichthöhe',
    'durchmesser': 'Durchmesser'
  }

  constructor(public coiltypesService:CoiltypesService, public coilsService:CoilsService, private router:Router) {

  }

  public get isCoilSelector(): boolean { 
    return this.coiltypesService.isCoilSelector;
  }

  public openCoiltype(coiltype:Coiltype) {
    const coiltypeId = coiltype.id!;

    if (this.coiltypesService.isCoilSelector) {
      this.coilsService.selectedElementCopy!.coiltypeId = coiltypeId;
      this.coilsService.selectedElementCopy!.coiltype = this.coiltypesService.getCopyElement(coiltypeId);

      this.router.navigate(['/coil-management']);
      return;
    }

    this.coiltypesService.selectElement(coiltypeId);
  }

  public updateHoveredCoiltype(event:{element:Coiltype|null, mousePosition:{x:number, y:number}|null}) {
    this.hoveredCoiltype = event.element;
    this.mousePosition = event.mousePosition;
  }
}
