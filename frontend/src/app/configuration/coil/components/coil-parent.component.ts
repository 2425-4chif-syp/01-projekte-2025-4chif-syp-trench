import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoilListComponent } from './list/coil-list.component';
import { CoilManagementComponent } from './management/coil-management.component';
import { CoilsService } from '../services/coils.service';

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
