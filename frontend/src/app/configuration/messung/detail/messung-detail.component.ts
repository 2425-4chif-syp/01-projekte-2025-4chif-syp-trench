import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { Messung } from '../interfaces/messung';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';

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

  curMessung: Messung | null = null;
  recentMesswerte = signal<Messwert[]>([]);

  async ngOnInit(): Promise<void> {
    this.curMessung = this.messungService.clickedMessung;
    await this.loadMesswerte();
  }

  private async loadMesswerte(): Promise<void> {
    if (!this.curMessung || !this.curMessung.id) {
      this.recentMesswerte.set([]);
      return;
    }
    
    const messwerte: Messwert[] = await this.messwertService.getMesswerteByMessungId(this.curMessung.id);
    this.recentMesswerte.set(messwerte);
  }
}
