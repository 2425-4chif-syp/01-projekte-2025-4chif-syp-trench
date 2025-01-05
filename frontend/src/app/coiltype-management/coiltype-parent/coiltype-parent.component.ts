import { Component } from '@angular/core';
import { CoilsService } from '../../data/coil-data/coils.service';
import { CommonModule } from '@angular/common';
import { CoiltypeListComponent } from '../coiltype-list/coiltype-list.component';
import { CoiltypeManagementComponent } from '../coiltype-management/coiltype-management.component';

@Component({
  selector: 'app-coiltype-parent',
  standalone: true,
  imports: [CommonModule, CoiltypeListComponent, CoiltypeManagementComponent],
  templateUrl: './coiltype-parent.component.html',
  styleUrl: './coiltype-parent.component.scss'
})
export class CoiltypeParentComponent {
  constructor(public coilsService:CoilsService) {}
}
