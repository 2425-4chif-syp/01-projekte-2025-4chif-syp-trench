import { Component } from '@angular/core';
import { CoilManagementComponent } from '../coil-management/coil-management.component';
import { CoilsService } from '../../data/coil-data/coils.service';
import { CommonModule } from '@angular/common';
import { CoilListComponent } from '../coil-list/coil-list.component';

@Component({
  selector: 'app-coil-parent',
  standalone: true,
  imports: [CommonModule, CoilListComponent, CoilManagementComponent],
  templateUrl: './coil-parent.component.html',
  styleUrl: './coil-parent.component.scss'
})
export class CoilParentComponent {
  constructor(public coilsService:CoilsService) {}
}
