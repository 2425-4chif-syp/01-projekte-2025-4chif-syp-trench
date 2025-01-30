import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coiltype-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coiltype-list.component.html',
  styleUrl: './coiltype-list.component.scss'
})
export class CoiltypeListComponent {
  public sortedCoiltypes: Coiltype[] = [];

  private sortDirection: { [key: string]: boolean } = {};

  constructor(public coiltypesService:CoiltypesService, private coilsService:CoilsService, private router:Router) {
    this.initialize();
  }

  async initialize() {
    await this.coiltypesService.reloadCoiltypes();
    this.sortedCoiltypes = [...this.coiltypesService.coiltypes]
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
}
