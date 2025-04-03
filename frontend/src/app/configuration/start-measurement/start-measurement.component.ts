import { Component, LOCALE_ID, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule], 
  providers: [WebSocketService, { provide: LOCALE_ID, useValue: 'de' }],
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent implements OnDestroy {
  sensorValues: { [key: string]: number } = {}; 
  isConnected: boolean = false;

  constructor(private webSocketService: WebSocketService) {}

  startMeasurement(): void {
    this.webSocketService.connect();
    this.isConnected = true;

    this.webSocketService.getMessages().subscribe((message) => {
      const [topic, value] = message.split(':'); 
      this.sensorValues[topic] = parseFloat(value);
    });
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