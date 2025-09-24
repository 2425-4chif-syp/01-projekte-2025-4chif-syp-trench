import { Component } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { Messung } from '../interfaces/messung';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [],
  templateUrl: './messung-detail.component.html',
  styleUrl: './messung-detail.component.scss'
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService) {}

  curMessung: Messung | null = null
}
