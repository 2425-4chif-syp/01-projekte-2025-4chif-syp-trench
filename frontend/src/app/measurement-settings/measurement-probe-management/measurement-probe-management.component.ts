import { Component, signal } from '@angular/core';
import { MeasurementProbe } from '../../data/measurement-probes/measurement-probes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-measurement-probe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-management.component.html',
  styleUrl: './measurement-probe-management.component.scss',
})
export class MeasurementProbeManagementComponent {
  yokeAmount = 4;
  selectedProbe: MeasurementProbe | undefined;
  modal: any;
  errorMessage: string | null = null;
  isNewProbe = true;

  measurementProbes: MeasurementProbe[] = [
    { id: 1, width: 50, yoke: 1, position: 1 },
    { id: 2, width: 50, yoke: 1, position: 2 },
    { id: 3, width: 50, yoke: 1, position: 3 },
    { id: 4, width: 50, yoke: 2, position: 1 },
    { id: 5, width: 50, yoke: 2, position: 2 },
    { id: 6, width: 50, yoke: 2, position: 3 },
    { id: 7, width: 50, yoke: 3, position: 1 },
    { id: 8, width: 50, yoke: 3, position: 2 },
    { id: 9, width: 50, yoke: 3, position: 3 },
    { id: 10, width: 50, yoke: 4, position: 1 },
    { id: 11, width: 50, yoke: 4, position: 2 },
    { id: 12, width: 50, yoke: 4, position: 3 },
  ];

  groupedProbes = signal<MeasurementProbe[][]>([]);

  ngOnInit(): void {
    this.groupSensors();
  }

  groupSensors() {
    if (this.measurementProbes.length > 0) {
      const yokeCount = this.measurementProbes[0];
      this.groupedProbes.set(Array.from({ length: this.yokeAmount }, () => []));

      for (const probe of this.measurementProbes) {
        const index = probe.yoke - 1;
        this.groupedProbes()[index].push(probe);
      }
    }
  }

  openModal(probe: any): void {
    this.selectedProbe = { ...probe };
  }

  closeModal(): void {
    this.selectedProbe = undefined;
    this.isNewProbe = false;
  }

  saveChanges(): void {
    const index = this.measurementProbes.findIndex((probe) => probe.id === this.selectedProbe!.id);

    if (!this.isValidProbe(this.selectedProbe!)) {
      this.errorMessage = "Bitte gültige Werte eingeben! Keine leeren Felder, keine 0 oder negativen Zahlen.";
      return;
    }

    if (this.isNewProbe) {
      this.measurementProbes.push({
        id: this.selectedProbe!.id!,
        width: this.selectedProbe!.width!,
        yoke: this.selectedProbe!.yoke!,
        position: this.selectedProbe!.position!
      } as MeasurementProbe);
    } else {
      const index = this.measurementProbes.findIndex(probe => probe.id === this.selectedProbe!.id);
      if (index !== -1) {
        this.measurementProbes[index] = {
          id: this.selectedProbe!.id!,
          width: this.selectedProbe!.width!,
          yoke: this.selectedProbe!.yoke!,
          position: this.selectedProbe!.position!
        } as MeasurementProbe;
      }
    }

    this.closeModal();
    this.groupSensors();

    console.log(this.measurementProbes[index]);
  }

  isValidProbe(probe: MeasurementProbe): boolean {
    return (
      probe.width > 0 &&
      probe.position > 0 &&
      probe.yoke > 0 &&
      probe.yoke <= this.yokeAmount
    );
  }

  addMeasurementProbe(yoke: number): void {
    const existingProbes = this.measurementProbes.filter(probe => probe.yoke === (yoke + 1));
    const maxPosition = existingProbes.length > 0
      ? Math.max(...existingProbes.map(probe => probe.position))
      : 0;

    const newProbe = {
      id: this.measurementProbes.length + 1,
      width: 50,
      yoke: yoke + 1,
      position: maxPosition + 1
    };
    this.isNewProbe = true;

    this.openModal(newProbe);
    this.selectedProbe = newProbe;
  }
}
