import { Component, LOCALE_ID, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DisplacementVisualizationComponent } from "../../visualization/displacement/components/displacement-visualization.component";
import { FormsModule } from '@angular/forms';
import { MeasurementSetting } from '../measurement-settings/interfaces/measurement-settings';
import { MeasurementSettingsService } from '../measurement-settings/services/measurement-settings.service';
import { Coil } from '../coil/interfaces/coil';
import { BackendService } from '../../backend.service';
import { Coiltype } from '../coiltype/interfaces/coiltype';

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
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private webSocketService: WebSocketService,
    public measurementSettingsService: MeasurementSettingsService,
    private backendService: BackendService
  ) {
    this.loadMeasurementSettings();
  }
  
  public get selectedMeasurementSetting(): MeasurementSetting | null {
    // Loose comparison using == here seems to be necessary, not sure why
    return this.measurementSettingsService.elements.find(setting => setting.id == this.measurementSettingId) ?? null;
  }

  async loadMeasurementSettings(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    await this.measurementSettingsService.reloadElements();
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
      let coil:Coil|null = this.selectedMeasurementSetting!.coil ?? null;
      
      if (coil === null) {
        coil = await this.backendService.getCoil(this.selectedMeasurementSetting?.coilId!);
      }
      this.selectedMeasurementSetting!.coil = coil;
      let coiltype:Coiltype|null = coil!.coiltype ?? null;
      if (coiltype === null) {
        coiltype = await this.backendService.getCoiltype(coil!.coiltypeId!);
      }
      this.selectedMeasurementSetting!.coil.coiltype = coiltype;

      const yokeCount:number = coiltype.schenkel!;
      const sensorCount:number = this.selectedMeasurementSetting!.sondenProSchenkel!; 
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

          if (yokeIndex >= yokeCount || sensorIndex >= sensorCount) {
            console.log(`Skipped message: Yoke ${yokeIndex+1}, Sensor ${sensorIndex+1}, Value ${sensorValue}`);
            return;
          }
    
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