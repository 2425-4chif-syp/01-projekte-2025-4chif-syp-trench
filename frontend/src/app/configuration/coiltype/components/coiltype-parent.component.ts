import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoiltypeListComponent } from './list/coiltype-list.component';
import { CoiltypeManagementComponent } from './management/coiltype-management.component';
import { CoiltypesService } from '../services/coiltypes.service';

@Component({
  selector: 'app-coiltype-parent',
  standalone: true,
  imports: [CommonModule, CoiltypeListComponent, CoiltypeManagementComponent],
  templateUrl: './coiltype-parent.component.html',
  styleUrl: './coiltype-parent.component.scss'
})
export class CoiltypeParentComponent {
  constructor(public coiltypesService:CoiltypesService) {}
}
