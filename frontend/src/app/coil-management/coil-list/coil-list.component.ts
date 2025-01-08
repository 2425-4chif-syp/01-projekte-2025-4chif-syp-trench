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
  constructor(public coilsService:CoilsService) {
    this.initialize();
  }

  async initialize() {
    await this.coilsService.reloadCoils();
  }

  async addNewCoil() {
    console.log(await this.coilsService.addNewCoil());
  }

  openCoil(coilId:number) {
    this.coilsService.selectCoil(coilId);
  }
}
