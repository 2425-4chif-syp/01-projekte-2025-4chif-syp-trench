import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeasurementProbe } from '../interfaces/measurement-probes';

@Component({
  selector: 'app-measurement-probe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-management.component.html',
  styleUrl: './measurement-probe-management.component.scss',
})
export class MeasurementProbeManagementComponent {

  constructor() { }

  yokeAmount = 4;
  selectedProbe: MeasurementProbe | undefined;
  probeToDelete: MeasurementProbe | undefined;
  modal: any;
  errorMessage: string | null = null;
  isNewProbe = false;

  measurementProbes: MeasurementProbe[] = [];
  groupedProbes = signal<MeasurementProbe[][]>([]);

  groupSensors() {
    if (this.measurementProbes.length > 0) {
      this.groupedProbes.set(Array.from({ length: this.yokeAmount }, () => []));

      for (const probe of this.measurementProbes) {
        const index = probe.yoke - 1;
        this.groupedProbes()[index].push(probe);
      }
    }
    else{
      console.log("No probes found");
    }
  }

  openModal(probe: any): void {
    this.selectedProbe = { ...probe };
  }

  closeModal(): void {
    this.selectedProbe = undefined;
    this.isNewProbe = false;
  }
  
  confirmDelete(probe: MeasurementProbe): void {
    this.probeToDelete = probe;
  }

  cancelDelete(): void {
    this.probeToDelete = undefined;
  }

  deleteProbe(): void {
    if (this.probeToDelete) {
      this.measurementProbes = this.measurementProbes.filter(probe => probe.id !== this.probeToDelete!.id);
      this.probeToDelete = undefined;
      this.groupSensors();
    }
  }

  saveChanges(): void {
    alert('Not implemented (measurement probes deleted from backend)');
    this.closeModal();
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
      probeType: { probeTypeID: 1, windingNumber: 15 },
      probeTypeId: 1,
      position: maxPosition + 1
    };
    this.isNewProbe = true;

    this.openModal(newProbe);
    //this.selectedProbe = newProbe;
  }
}
