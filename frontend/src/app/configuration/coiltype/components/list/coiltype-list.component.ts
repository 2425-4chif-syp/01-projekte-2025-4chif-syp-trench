import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class CoiltypeListComponent implements OnInit {
  public hoveredCoiltype: Coiltype | null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public readonly keysAsColumns: { [key: string]: string } = {
    'id': 'ID',
    'name': 'Name',
    'schenkel': 'Schenkelanzahl',
    'bandbreite': 'Bandbreite',
    'schichthoehe': 'Schichthöhe',
    'durchmesser': 'Durchmesser',
    'toleranzbereich': 'Toleranzbereich'
  }

  constructor(
    public  coiltypesService: CoiltypesService,
    public  coilsService:    CoilsService,
    private router:          Router,
    private route:           ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const queryParams = this.route.snapshot.queryParamMap;
    const selector    = queryParams.get('selector');
    const coilIdParam = queryParams.get('coilId');

    if (selector === 'coil') {
      this.coiltypesService.isCoilSelector = true;

      // Spulen-Kontext nach Reload wiederherstellen
      if (!this.coilsService.selectedElementCopy) {
        // 1) Versuch über ID (bestehende Spule)
        if (coilIdParam) {
          const coilId = Number(coilIdParam);
          if (!Number.isNaN(coilId) && coilId > 0) {
            try {
              await this.coilsService.reloadElementWithId(coilId);
              this.coilsService.selectedElementCopy = this.coilsService.getCopyElement(coilId);
              this.coilsService.selectedElementIsNew = false;
              return;
            } catch (err) {
              console.error('Fehler beim Wiederherstellen der Spule für Spulentyp-Auswahl:', err);
            }
          }
        }

        // 2) Fallback: Entwurf aus LocalStorage (neue / ungespeicherte Spule)
        const draft = this.coilsService.loadDraftFromStorage();
        if (!draft) {
          // 3) Letzter Fallback: komplett neue Spule
          this.coilsService.selectedElementCopy  = this.coilsService.newElement;
          this.coilsService.selectedElementIsNew = true;
        }
      }
    }
  }

  public get isCoilSelector(): boolean { 
    return this.coiltypesService.isCoilSelector;
  }

  public openCoiltype(coiltype:Coiltype) {
    const coiltypeId = coiltype.id!;

    if (this.coiltypesService.isCoilSelector) {
      if (!this.coilsService.selectedElementCopy) {
        console.error('Kein Spulen-Kontext für Spulentyp-Auswahl vorhanden.');
        this.coiltypesService.isCoilSelector = false;
        this.router.navigate(['/coil-management']);
        return;
      }

      this.coilsService.selectedElementCopy.coiltypeId = coiltypeId;
      this.coilsService.selectedElementCopy.coiltype   = this.coiltypesService.getCopyElement(coiltypeId);

      this.router.navigate(['/coil-management']);
      return;
    }

    this.coiltypesService.selectElement(coiltypeId);
  }

  public updateHoveredCoiltype(event:{element:Coiltype|null, mousePosition:{x:number, y:number}|null}) {
    this.hoveredCoiltype = event.element;
    this.mousePosition = event.mousePosition;
  }

  public handleBack(): void {
    if (this.coiltypesService.isCoilSelector) {
      this.coiltypesService.isCoilSelector = false;
      // Return to the originating page (measurement settings or coil management)
      // Here, coil type selection is only used from coil management, so navigate back there
      this.router.navigate(['/coil-management']);
    }
  }
}
