import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoilsService } from '../../data/coil-data/coils.service';
import { Coil } from '../../data/coil-data/coil';

@Component({
  selector: 'app-coiltype-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coiltype-list.component.html',
  styleUrl: './coiltype-list.component.scss'
})
export class CoiltypeListComponent {
  constructor(public coilsService:CoilsService) {}

  addNewCoil() {
    const newCoil: Coil = this.coilsService.addNewCoil();

    //this.coilsService.selectCoil(newCoil.id);
  }

  openCoil(coilId:number) {
    this.coilsService.selectCoil(coilId);
  }
}
