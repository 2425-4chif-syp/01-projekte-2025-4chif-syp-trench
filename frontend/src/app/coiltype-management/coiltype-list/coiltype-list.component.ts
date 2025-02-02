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

  public mousePosition: { x: number, y: number } = { x: 0, y: 0 };

  constructor(public coiltypesService:CoiltypesService, public coilsService:CoilsService, private router:Router) {
    this.initialize();
  }

  public get isCoilSelector(): boolean { 
    return this.coiltypesService.isCoilSelector;
  }

  async initialize() {
    await this.coiltypesService.reloadCoiltypes();
    this.sortedCoiltypes = [...this.coiltypesService.coiltypes]
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

    this.coiltypesService.selectedCoiltypeCopy = newCoiltype;
    this.coiltypesService.selectedCoiltypeIsNew = true; 
  }

  openCoiltype(coiltypeId:number) {
    if (this.coiltypesService.isCoilSelector) {
      this.coilsService.selectedCoilCopy!.coiltypeId = coiltypeId;
      this.coilsService.selectedCoilCopy!.coiltype = this.coiltypesService.getCopyCoiltype(coiltypeId);

      this.router.navigate(['/coil-management']);
      return;
    }

    this.coiltypesService.selectCoiltype(coiltypeId);
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
    console.log('Mouse posiotion:', event.clientX, event.clientY);
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }
}
