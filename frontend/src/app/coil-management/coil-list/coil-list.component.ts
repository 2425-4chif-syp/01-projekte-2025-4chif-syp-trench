import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';

@Component({
  selector: 'app-coil-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coil-list.component.html',
  styleUrl: './coil-list.component.scss'
})
export class CoilListComponent {
  constructor(public coilsService:CoilsService) {}

  addNewCoil() {
    const newCoil: Coil = this.coilsService.addNewCoil();

    //this.coilsService.selectCoil(newCoil.id);
  }

  openCoil(coilId:number) {
    this.coilsService.selectCoil(coilId);
  }
}
