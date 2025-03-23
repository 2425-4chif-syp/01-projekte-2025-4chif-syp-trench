import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Router } from '@angular/router';
import { CoilVisualizationComponent } from '../../coil-visualization/coil-visualization.component';
import { GenericListComponent } from '../../generic-list/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../data/list-service';

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
    'tK_Name': 'Name',
    'schenkel': 'Schenkelanzahl',
    'bb': 'Bandbreite',
    'sh': 'Schichthöhe',
    'dm': 'Durchmesser'
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
