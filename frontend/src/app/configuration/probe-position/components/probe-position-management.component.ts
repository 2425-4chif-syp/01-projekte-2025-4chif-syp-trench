import { Component, signal } from '@angular/core';
import { Probe } from '../../probe/interfaces/probe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';
import { MeasurementSettingsComponent } from '../../measurement-settings/components/management/measurement-settings.component';
import { ProbePositionsBackendService } from '../services/probe-positions-backend.service';
import { ProbesService } from '../../probe/services/probes.service';
import { ProbesBackendService } from '../../probe/services/probes-backend.service';

@Component({
  selector: 'app-probe-position-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './probe-position-management.component.html',
  styleUrl: './probe-position-management.component.scss'
})
export class ProbePositionManagementComponent {
  yokeAmount = 4;
  selectedProbe: Probe | undefined;
  probeToDelete: Probe | undefined;
  modal: any;
  errorMessage: string | null = null;
  isNewProbe = false;
  groupedProbes: Probe[][] = [];

  constructor(public measurementSettingsService: MeasurementSettingsService, private probePositionBackendService: ProbePositionsBackendService, private probeService: ProbesService) {
    //this.probeService.reloadElements();
  }

  async ngOnInit(): Promise<void> {
    console.log("Initialisiere Komponente...");
  
    await this.probeService.reloadElements();
    console.log("Sonden geladen:", this.probeService.elements);
  
    this.groupSensors();

    await this.generateAndSavePositions();
  }
  

  groupSensors() {
    if (this.probeService.elements.length > 0) {
      const yokeCount = this.probeService.elements[0];
      console.log("test", this.measurementSettingsService.selectedElementCopy);
      this.groupedProbes = Array.from({ length: 3 }, () => []);
      console.log("Gruppierung der Sonden:", this.groupedProbes);

      let sum = 0;

      for (const probe of this.probeService.elements) {
        const index = sum % 3;
        sum += 1;
        this.groupedProbes[index].push(probe);
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
  
  confirmDelete(probe: Probe): void {
    this.probeToDelete = probe;
  }

  cancelDelete(): void {
    this.probeToDelete = undefined;
  }

  deleteProbe(): void {
    if (this.probeToDelete) {
      //this.probeService.elements = this.probeService.elements.filter(probe => probe.id !== this.probeToDelete!.id);
      this.probeToDelete = undefined;
      this.groupSensors();
    }
  }

  saveChanges(): void {
    const index = this.probeService.elements.findIndex((probe) => probe.id === this.selectedProbe!.id);

    if (!this.isValidProbe(this.selectedProbe!)) {
      this.errorMessage = "Bitte gültige Werte eingeben! Keine leeren Felder, keine 0 oder negativen Zahlen.";
      return;
    }

    
    this.closeModal();
    this.groupSensors();

    console.log(this.probeService.elements[index]);
  }

  isValidProbe(probe: Probe): boolean {
    return (
      true
    );
  }

  addMeasurementProbe(yoke: number): void {
    /*const existingProbes = this.measurementProbes.filter(probe => probe.yoke === (yoke + 1));
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
    this.selectedProbe = newProbe;*/
  }

  async generateAndSavePositions(): Promise<void> {
    const setting = this.measurementSettingsService.selectedElementCopy;
    if (!setting || !setting.coil || !setting.coil.coiltype || !setting.id) {
      console.error("Ungültige Messeinstellung!");
      return;
    }

    const schenkelAnzahl = 3 // this.measurementSettingsService.selectedElementCopy!.coil?.coiltype?.schenkel!;
    const sondenProSchenkel = setting.sondenProSchenkel!;
    const probes = this.probeService.elements;

    console.log("Schenkelanzahl:", schenkelAnzahl);
    console.log("Sonden pro Schenkel:", sondenProSchenkel);
    console.log("Probe:", probes);
  
    const totalNeeded = schenkelAnzahl * sondenProSchenkel;
    if (probes.length < totalNeeded) {
      console.warn("Nicht genügend Sonden vorhanden!");
      return;
    }
  
    let probeIndex = 0;
  
    for (let schenkel = 1; schenkel <= schenkelAnzahl; schenkel++) {
      for (let pos = 1; pos <= sondenProSchenkel; pos++) {
        const probe = probes[probeIndex++];
        const probePosition = {
          id: 0,
          measurementSettingsId: setting.id,
          measurementSetting: null,
          measurementProbeId: probe.id!,
          measurementProbe: null,
          schenkel: schenkel,
          position: pos
        };
  
        try {
          await this.probePositionBackendService.addProbePosition(probePosition);
          console.log(`Position gespeichert: Schenkel ${schenkel}, Pos ${pos}`);
        } catch (error) {
          console.error("Fehler beim Speichern einer Position:", error);
        }
      }
    }
  
    console.log("Alle Positionen gespeichert.");
  }

}
