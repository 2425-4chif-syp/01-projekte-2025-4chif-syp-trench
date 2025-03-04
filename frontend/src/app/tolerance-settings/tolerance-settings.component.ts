import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface SensorTolerance {
  name: string;
  greenMax: number;
  yellowMax: number;
}

@Component({
  selector: 'app-tolerance-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tolerance-settings.component.html',
  styleUrl: './tolerance-settings.component.scss'
})
export class ToleranceSettingsComponent implements OnInit {
  tolerances: SensorTolerance[] = [];

  getBackgroundColor(value: number, sensorName: string): string {
    if (value >= 0 && value <= 0.4) return 'green';
    if (value >= 0.41 && value <= 0.7) return 'yellow';
    if (value >= 0.71 && value <= 1) return 'red';
    return 'gray';
  }

  ngOnInit() {
    // Lade existierende Toleranzen oder initialisiere mit neuen Standardwerten
    const savedTolerances = localStorage.getItem('sensorTolerances');
    if (savedTolerances) {
      this.tolerances = JSON.parse(savedTolerances);
    } else {
      // Initialisiere 6 Sensoren mit den neuen Standardwerten
      for (let i = 1; i <= 6; i++) {
        this.tolerances.push({
          name: `trench_test/sensor_${i}`,
          greenMax: 0.4,
          yellowMax: 0.7    // Der Übergang zu Rot beginnt bei 0.71
        });
      }
    }
  }

  saveTolerance() {
    localStorage.setItem('sensorTolerances', JSON.stringify(this.tolerances));
    alert('Toleranzwerte wurden gespeichert!');
  }
} 