import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-measurement-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent {
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5]) 
  saveMessage: string | null = null

  measurementSettings = {
    bemessungsSpannung: 0,
    bemessungsFrequenz: 0,
    sondenProSchenkel: 1,
    messStaerke: 0
  };

  saveChanges() {
    console.log('Einstellungen gespeichert:', this.measurementSettings);
    this.saveMessage = 'Änderungen gespeichert!';
    setTimeout(() => {
      this.saveMessage = null;
    }, 3000);
  }  
}
