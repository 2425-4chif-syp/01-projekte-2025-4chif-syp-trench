import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';
import { Router } from '@angular/router';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete-modal/confirm-delete-modal.component';
import { MessungDetailAuswertungComponent } from './auswertung/messung-detail-auswertung/messung-detail-auswertung.component';
import { Measurement } from '../../measurement-history/interfaces/measurement.model';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteModalComponent, MessungDetailAuswertungComponent],
  templateUrl: './messung-detail.component.html',
  styleUrl: './messung-detail.component.scss'
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService,
    private router: Router) {}

  measurement: Measurement | null = null;
  recentMesswerte = signal<Messwert[]>([]);
  showDeleteModal: boolean = false;

  yokes = signal<{ sensors: number[] }[]>([]);
  yokeData = signal<{ x: number; y: number }[][]>([]);
  m_tot = signal<number>(0);

  async ngOnInit(): Promise<void> {
    this.measurement = this.messungService.clickedMessung;
    await this.loadMesswerte();
  }

  private async loadMesswerte(): Promise<void> {
    if (!this.measurement || !this.measurement.id) {
      this.recentMesswerte.set([]);
      return;
    }
    
    const messwerte: Messwert[] = await this.messwertService.getMesswerteByMessungId(this.measurement.id);
    this.recentMesswerte.set(messwerte);
  }

  public navigateBack(): void {
    this.router.navigate(['/measurement-management']);
  }

  public openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  public async confirmDeleteCurrentMessung(): Promise<void> {
    if (!this.measurement || !this.measurement.id) {
      return;
    }

    try {
      await this.messungService.deleteElement(this.measurement.id);
      this.router.navigate(['/measurement-management']);
    } catch (error) {
      console.error('Fehler beim Löschen der Messung:', error);
    } finally {
      this.showDeleteModal = false;
    }
  }
}
