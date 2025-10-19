import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { Messung } from '../interfaces/messung';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';
import { CommonModule } from '@angular/common';
import { MesswertSliderComponent } from '../../messwert/slider/messwert-slider.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, MesswertSliderComponent],
  templateUrl: './messung-detail.component.html',
  styleUrl: './messung-detail.component.scss'
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService) {}

  curMessung: Messung | null = null;
  allMesswerte = signal<Messwert[]>([]);
  currentMesswerte = signal<Messwert[]>([]);

  async ngOnInit(): Promise<void> {
    this.curMessung = this.messungService.clickedMessung;
    await this.loadMesswerte();
  }

  private async loadMesswerte(): Promise<void> {
    const allMesswerte: Messwert[] = await this.messwertService.getAllMesswerte();
    const filteredMesswerte: Messwert[] = [];
    allMesswerte.forEach(mw => {
      if (mw.messungID == this.curMessung!.id) {
        filteredMesswerte.push(mw);
      }
    });
    this.allMesswerte.set(filteredMesswerte);
  }

  onDataChange(data: Messwert[]) {
    this.currentMesswerte.set(data)
  }
}
