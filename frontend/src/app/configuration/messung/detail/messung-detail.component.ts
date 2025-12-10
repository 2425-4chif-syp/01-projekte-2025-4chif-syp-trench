import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { Messung } from '../interfaces/messung';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';
import { Router } from '@angular/router';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteModalComponent],
  templateUrl: './messung-detail.component.html',
  styleUrl: './messung-detail.component.scss'
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService,
    private router: Router) {}

  curMessung: Messung | null = null;
  recentMesswerte = signal<Messwert[]>([]);
  showDeleteModal: boolean = false;

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

  public navigateBack(): void {
    this.router.navigate(['/measurement-management']);
  }

  public openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  public async confirmDeleteCurrentMessung(): Promise<void> {
    if (!this.curMessung || !this.curMessung.id) {
      return;
    }

    try {
      await this.messungService.deleteElement(this.curMessung.id);
      this.router.navigate(['/measurement-management']);
    } catch (error) {
      console.error('Fehler beim Löschen der Messung:', error);
    } finally {
      this.showDeleteModal = false;
    }
  }
}
