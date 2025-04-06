import { Component, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { MeasurementSettingsService, MeasurementSetting } from './services/get-measurement-settings-id.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

registerLocaleData(localeDe);

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], 
  providers: [WebSocketService, MeasurementSettingsService, { provide: LOCALE_ID, useValue: 'de' }],
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent implements OnInit, OnDestroy {
  sensorValues: { [key: string]: number } = {}; 
  isConnected: boolean = false;
  measurementSettingId: number | null = null;
  note: string = '';
  showIdError: boolean = false;
  measurementSettings: MeasurementSetting[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private measurementSettingsService: MeasurementSettingsService
  ) {}

  ngOnInit(): void {
    this.loadMeasurementSettings();
  }

  loadMeasurementSettings(): void {
    this.isLoading = true;
    this.error = null;
    
    this.measurementSettingsService.getMeasurementSettings().subscribe({
      next: (settings) => {
        this.measurementSettings = settings;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Messeinstellungen:', err);
        this.error = 'Fehler beim Laden der Messeinstellungen';
        this.isLoading = false;
      }
    });
  }

  isValid(): boolean {
    return this.measurementSettingId !== null && this.measurementSettingId > 0;
  }

  async startMeasurement(): Promise<void> {
    if (!this.isValid()) {
      this.showIdError = true;
      return;
    }

    try {
      await this.webSocketService.connect();
      this.isConnected = true;
      this.showIdError = false;

      const config = {
        type: 'config',
        measurementSettingId: this.measurementSettingId,
        note: this.note
      };
      console.log('Sende Konfiguration:', config);
      this.webSocketService.sendMessage(JSON.stringify(config));

      this.webSocketService.getMessages().subscribe((message) => {
        console.log('Empfangene Nachricht:', message);
        try {
          const data = JSON.parse(message);
          if (data.status === 'ok') {
            console.log('Konfiguration wurde vom Server bestätigt');
          }
        } catch {
          const [topic, value] = message.split(':');
          this.sensorValues[topic] = parseFloat(value);
        }
      });
    } catch (error) {
      console.error('Fehler beim Verbinden:', error);
      this.isConnected = false;
      this.showIdError = true;
    }
  }

  stopMeasurement(): void {
    this.webSocketService.disconnect();
    this.isConnected = false;
    this.sensorValues = {};
  }

  ngOnDestroy(): void {
    this.stopMeasurement();
  }

  getSensorKeys(): string[] {
    return Object.keys(this.sensorValues);
  }

  getGroupedSensors(): { [schenkel: string]: string[] } {
    const grouped: { [schenkel: string]: string[] } = {};
  
    for (const key of this.getSensorKeys()) {
      const match = key.match(/S(\d+)S\d+/); 
      if (match) {
        const schenkel = `Schenkel ${match[1]}`;
        if (!grouped[schenkel]) {
          grouped[schenkel] = [];
        }
        grouped[schenkel].push(key);
      }
    }
  
    return grouped;
  }
  
  getGroupedSensorKeys(): string[] {
    return Object.keys(this.getGroupedSensors());
  }
}