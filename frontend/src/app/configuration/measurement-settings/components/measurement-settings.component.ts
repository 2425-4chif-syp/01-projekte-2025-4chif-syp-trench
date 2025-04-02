import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeasurementProbeManagementComponent } from '../../measurement-probe/components/measurement-probe-management.component';
import { MeasurementSetting } from '../interfaces/measurement-settings';


@Component({
  selector: 'app-measurement-settings',
  standalone: true,
  imports: [FormsModule, MeasurementProbeManagementComponent, CommonModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent {
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5]) 
  saveMessage: string | null = null

  measurementSettings: MeasurementSetting = {
    coil: null,
    coilId: null,
    measurementProbeType: null,
    measurementProbeTypeId: null,
    wicklungszahl: null,
    bemessungsspannung: null,
    bemessungsfrequenz: null,
    sondenProSchenkel: null,
    notiz: null
  };

  saveChanges() {
    console.log('Einstellungen gespeichert:', this.measurementSettings);
    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }  
}
