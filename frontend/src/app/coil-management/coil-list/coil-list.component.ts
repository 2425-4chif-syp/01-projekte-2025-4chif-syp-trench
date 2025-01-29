import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'app-coil-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coil-list.component.html',
  styleUrl: './coil-list.component.scss'
})
export class CoilListComponent {
  public sortedCoils: Coil[] = [];

  private sortDirection: { [key: string]: boolean } = {};

  constructor(public coilsService: CoilsService) {
    this.initialize();
  }

  async initialize() {
    await this.coilsService.reloadCoils();
    this.sortedCoils = [...this.coilsService.coils];
  }

  async addNewCoil() {
    await this.coilsService.addNewCoil();
    this.sortedCoils = [...this.coilsService.coils];
  }

  openCoil(coilId: number) {
    this.coilsService.selectCoil(coilId);
  }

  sortTable(column: keyof Coil) {
    const direction = this.sortDirection[column] = !this.sortDirection[column];

    this.sortedCoils.sort((a, b) => {
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


