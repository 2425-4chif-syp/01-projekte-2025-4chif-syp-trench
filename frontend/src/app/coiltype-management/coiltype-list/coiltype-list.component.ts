import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Router } from '@angular/router';
import { CoilVisualizationComponent } from '../../coil-visualization/coil-visualization.component';

@Component({
  selector: 'app-coiltype-list',
  standalone: true,
  imports: [CommonModule, CoilVisualizationComponent],
  templateUrl: './coiltype-list.component.html',
  styleUrl: './coiltype-list.component.scss'
})
export class CoiltypeListComponent {
  public sortedCoiltypes: Coiltype[] = [];

  private sortDirection: { [key: string]: boolean } = {};

  public hoveredCoiltype: Coiltype | null = null;

  public mousePosition: { x: number, y: number }|null = null;

  constructor(public coiltypesService:CoiltypesService, public coilsService:CoilsService, private router:Router) {
    this.initialize();
  }

  public get isCoilSelector(): boolean { 
    return this.coiltypesService.isCoilSelector;
  }

  async initialize() {
    await this.coiltypesService.reloadElements();
    this.sortedCoiltypes = [...this.coiltypesService.elements]
  }

  onElementHoverStart(coiltype:Coiltype) {
    this.hoveredCoiltype = coiltype;
  }
  onElementHoverEnd(coiltype:Coiltype) {
    if (this.hoveredCoiltype === coiltype) {
      this.hoveredCoiltype = null;
    }
  }

  async addNewCoiltype() {
    const newCoiltype:Coiltype = {
      id: 0,
      tK_Name: '',
      schenkel: 0,
      bb: 0,
      sh: 0,
      dm: 0
    };

    this.coiltypesService.selectedElementCopy = newCoiltype;
    this.coiltypesService.selectedElementIsNew = true; 
  }

  openCoiltype(coiltypeId:number) {
    if (this.coiltypesService.isCoilSelector) {
      this.coilsService.selectedElementCopy!.coiltypeId = coiltypeId;
      this.coilsService.selectedElementCopy!.coiltype = this.coiltypesService.getCopyElement(coiltypeId);

      this.router.navigate(['/coil-management']);
      return;
    }

    this.coiltypesService.selectElement(coiltypeId);
  }

  sortTable(column: keyof Coiltype) {
    const direction = this.sortDirection[column] = !this.sortDirection[column];

    this.sortedCoiltypes.sort((a, b) => {
      if (a[column]! < b[column]!) {
        return direction ? -1 : 1;
      }
      if (a[column]! > b[column]!) {
        return direction ? 1 : -1;
      }
      return 0;
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mousePosition = { x: event.pageX, y: event.pageY };
  }
}
