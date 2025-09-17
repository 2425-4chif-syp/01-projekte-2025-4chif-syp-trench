import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoilVisualizationComponent } from '../../../../visualization/coil/components/coil-visualization.component';
import { CoiltypesService } from '../../services/coiltypes.service';
import { Coiltype } from '../../interfaces/coiltype';

@Component({
  selector: 'app-coiltype-management',
  standalone: true,
  imports: [FormsModule, CommonModule, CoilVisualizationComponent],
  templateUrl: './coiltype-management.component.html',
  styleUrl: './coiltype-management.component.scss'
})
export class CoiltypeManagementComponent implements OnInit {
  @ViewChild('coiltypeSelectEl') coiltypeSelect?: ElementRef<HTMLSelectElement>;

  constructor(public coiltypesService: CoiltypesService) {}

  saveMessage: string | null = null;
  originalCoiltype: Coiltype | null = null;

  public get selectedCoiltype(): Coiltype | null {
    return this.coiltypesService.selectedElementCopy;
  }
  public get selectedCoiltypeId(): number | undefined {
    return this.coiltypesService.selectedElementCopy?.id!;
  }
  public set selectedCoiltypeId(id: number) {
    this.coiltypesService.selectElement(Number(id));
  }

  ngOnInit() {
    if (this.selectedCoiltype) {
      this.originalCoiltype = { ...this.selectedCoiltype };
    }
  }

  hasChanges(): boolean {
    if (!this.originalCoiltype || !this.selectedCoiltype) return false;
    return JSON.stringify(this.originalCoiltype) !== JSON.stringify(this.selectedCoiltype);
  }

  async onSubmit(form: NgForm) {
    if (!form.valid || !this.selectedCoiltype) return;

    try {
      await this.coiltypesService.updateOrCreateElement(this.selectedCoiltype);

      // Element nach dem Speichern neu laden (falls z. B. ID neu vergeben wurde)
      if (this.selectedCoiltypeId != null) {
        await this.coiltypesService.selectElement(this.selectedCoiltypeId);
      }

      this.saveMessage = 'Änderungen gespeichert!';
      setTimeout(() => (this.saveMessage = null), 1500);

      // Change-Tracking zurücksetzen
      this.originalCoiltype = this.selectedCoiltype ? { ...this.selectedCoiltype } : null;
      form.form.markAsPristine();

      // Dropdown wieder schließen, damit das Layout nicht verschoben wird
      this.coiltypeSelect?.nativeElement.blur();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      this.saveMessage = 'Fehler beim Speichern!';
    }
  }

  async onCoiltypeSelectionChange(coiltypeId: number) {
    const coiltypeIdNumber: number = Number(coiltypeId);
    await this.coiltypesService.selectElement(coiltypeIdNumber);
    this.coiltypeSelect?.nativeElement.blur();
    // Neues Original setzen, damit hasChanges korrekt ist
    if (this.selectedCoiltype) {
      this.originalCoiltype = { ...this.selectedCoiltype };
    }
  }

  showDeleteModal = false;

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  async deleteCoiltype(): Promise<void> {
    this.showDeleteModal = false;
    if (this.coiltypesService.selectedElementCopy === null) return;
    await this.coiltypesService.deleteElement(this.coiltypesService.selectedElementCopy.id!);
    this.originalCoiltype = null;
  }

  backToListing(): void {
    this.coiltypesService.selectedElementCopy = null;
    this.originalCoiltype = null;
  }
}
