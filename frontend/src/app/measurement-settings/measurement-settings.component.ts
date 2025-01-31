import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { measurementSettings } from '../data/measurement-settings/measurement-settings';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-measurement-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent {
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5]) 
  saveMessage: string | null = null
  hasSaved: boolean = false;

  measurementSettings: measurementSettings = {
    bemessungsSpannung: 0,
    bemessungsFrequenz: 0,
    sondenProSchenkel: 1,
    messStaerke: 0,
    zeitstempel: null
  };

  saveChanges() {
    console.log('Einstellungen gespeichert:', this.measurementSettings);
    this.hasSaved = true
    
    if (!this.isFieldInvalid('bemessungsSpannung') && !this.isFieldInvalid('bemessungsFrequenz') && !this.isFieldInvalid('sondenProSchenkel') && !this.isFieldInvalid('messStaerke')){
      this.saveMessage = 'Änderungen gespeichert!';
          setTimeout(() => {
            this.saveMessage = null;
          }, 3000);
    }
    else{
      this.saveMessage = 'Speichern fehlgeschlagen! Fülle alle Pflichtfelder aus';
        setTimeout(() => {
          this.saveMessage = null;
        }, 5000);
    }
  }  

  isFieldInvalid(field: String): boolean{
    if (!this.hasSaved){
      return false;
    }

    let value = this.measurementSettings[field as keyof measurementSettings]
    if (value === null || value === undefined){
      return true;
    }

    if(typeof value === 'number' && (field === 'bemessungsSpannung' || field === 'bemessungsFrequenz' || field === 'sondenProSchenkel' || field === 'messStaerke')){
      return value <= 0;
    }

    return false;
  }
}
