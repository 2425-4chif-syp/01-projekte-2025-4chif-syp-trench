import { Component, LOCALE_ID, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { MeasurementSetting, MeasurementSettingsService } from './services/get-measurement-settings-id.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DisplacementVisualizationComponent } from "../../visualization/displacement/components/displacement-visualization.component";
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

registerLocaleData(localeDe);

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule, DisplacementVisualizationComponent, FormsModule], 
  providers: [WebSocketService, { provide: LOCALE_ID, useValue: 'de' }],
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent implements OnDestroy {
  yokes = signal<{ sensors: number[] }[]>([]);
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
  ) {
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
      const yokeCount = 4; // TODO: Get this value from the backend from measurement-settings>coil>coiltype
      const sensorCount = 8; // TODO: Get this value from the backend from measurement-settings
      this.yokes.set(Array.from({ length: yokeCount }, () => ({ sensors: Array(sensorCount).fill(0) })));
      
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

      this.webSocketService.getMessages().subscribe({
        next: (message: string) => {
          console.log('Received message:', message);
  
          const [topic, value] = message.split(':'); 
          const yokeIndex: number = parseInt(topic.split('S')[1]) - 1;
          const sensorIndex: number = parseInt(topic.split('S')[2]) - 1;
          const sensorValue: number = parseFloat(value);
    
          //console.log(`Yoke: ${yokeIndex}, Sensor: ${sensorIndex}, Value: ${sensorValue}`);
    
          this.yokes.update((prevYokes) => {
            const updatedYokes = [...prevYokes];
            updatedYokes[yokeIndex].sensors[sensorIndex] = sensorValue;
            return updatedYokes;
          });
        },
        error: (err: any) => {
          console.error('Fehler beim Laden der Messeinstellungen:', err);
          this.error = 'Fehler beim Laden der Messeinstellungen';
          this.isLoading = false;
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
    this.yokes.set([]); 
  }

  ngOnDestroy(): void {
    this.stopMeasurement();
  }
}