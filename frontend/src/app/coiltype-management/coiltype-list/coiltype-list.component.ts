import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoiltypesService } from '../../data/coiltype-data/coiltypes.service';
import { Coiltype } from '../../data/coiltype-data/coiltype';

@Component({
  selector: 'app-coiltype-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coiltype-list.component.html',
  styleUrl: './coiltype-list.component.scss'
})
export class CoiltypeListComponent {
  constructor(public coiltypesService:CoiltypesService) {
    this.initialize();
  }

  async initialize() {
    await this.coiltypesService.reloadCoiltypes();
  }

  async addNewCoiltype() {
    console.log(await this.coiltypesService.addNewCoiltype());
  }

  openCoiltype(coiltypeId:number) {
    this.coiltypesService.selectCoiltype(coiltypeId);
  }
}
