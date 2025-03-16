import { Component, signal } from '@angular/core';
import { MeasurementProbe } from '../../data/measurement-probes/measurement-probes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';
import { MeasurementProbeService } from '../../data/measurement-probes/measurement-probe.service';

@Component({
  selector: 'app-measurement-probe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-management.component.html',
  styleUrl: './measurement-probe-management.component.scss',
})
export class MeasurementProbeManagementComponent {

  constructor(private measurementProbeService: MeasurementProbeService) { }

  yokeAmount = 4;
  selectedProbe: MeasurementProbe | undefined;
  probeToDelete: MeasurementProbe | undefined;
  modal: any;
  errorMessage: string | null = null;
  isNewProbe = false;

  measurementProbes: MeasurementProbe[] = [];
  groupedProbes = signal<MeasurementProbe[][]>([]);

  ngOnInit() {
    this.measurementProbeService.loadAllMeasurementProbes().then(() => {
    console.log("Component", this.measurementProbeService.measurementProbes);
    this.measurementProbes = this.measurementProbeService.measurementProbes;
    this.groupSensors();
    console.log("Grouped Probes", this.groupedProbes());
    });
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
      this.measurementProbeService.deleteMeasurementProbe(this.probeToDelete!);
      this.probeToDelete = undefined;
      this.groupSensors();
    }
  }

  saveChanges(): void {
    if (!this.isValidProbe(this.selectedProbe!)) {
      this.errorMessage = "Bitte gültige Werte eingeben! Keine leeren Felder, keine 0 oder negativen Zahlen.";
      return;
    }
  
    if (this.isNewProbe) {
      this.measurementProbeService.addMeasurementProbe(this.selectedProbe!).then(() => {
        return this.measurementProbeService.loadAllMeasurementProbes();
      }).then(() => {
        this.measurementProbes = this.measurementProbeService.measurementProbes;
        this.groupSensors();
      });
    } else {
      const index = this.measurementProbes.findIndex(probe => probe.id === this.selectedProbe!.id);
      if (index !== -1) {
        this.measurementProbes[index] = { ...this.selectedProbe! };
        this.measurementProbeService.updateMeasurementProbe(this.selectedProbe!);
        this.groupSensors();
      }
    }
  
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
    this.selectedProbe = newProbe;
  }
}
