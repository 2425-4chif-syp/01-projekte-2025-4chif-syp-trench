import { Component, signal } from '@angular/core';
import { MeasurementProbe } from '../../data/measurement-probes/measurement-probes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-measurement-probe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurement-probe-management.component.html',
  styleUrl: './measurement-probe-management.component.scss'
})
export class MeasurementProbeManagementComponent {
  private yokeAmount = 4;


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

  // Gruppierung der Sensoren anhand ihrer 'position'
  groupSensors() {
    if (this.measurementProbes.length > 0) {
      // Gesamtzahl der Jochs (alle Sensoren haben denselben Wert)
      const yokeCount = this.measurementProbes[0];
      // Initialisiere das Array für die Gruppen (z. B. 3 leere Arrays)
      this.groupedProbes.set(Array.from({ length: this.yokeAmount }, () => []));

      // Gehe alle Sensoren durch und sortiere sie in die jeweilige Gruppe ein
      for (const probe of this.measurementProbes) {
        // Da 'position' 1-indexiert ist, ziehen wir 1 ab
        const index = probe.yoke - 1;
        // Sensor in die entsprechende Gruppe einfügen
        this.groupedProbes()[index].push(probe);
      } 
    }
  }
}
