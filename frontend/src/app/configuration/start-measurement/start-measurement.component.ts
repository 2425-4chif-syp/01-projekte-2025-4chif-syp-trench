import { Component, LOCALE_ID, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DisplacementVisualizationComponent } from "../../visualization/displacement/components/displacement-visualization.component";

registerLocaleData(localeDe);

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule, DisplacementVisualizationComponent], 
  providers: [WebSocketService, { provide: LOCALE_ID, useValue: 'de' }],
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent implements OnDestroy {
  yokes = signal<{ sensors: number[] }[]>([]);

  isConnected: boolean = false;

  constructor(private webSocketService: WebSocketService) {}

  startMeasurement(): void {
    this.webSocketService.connect();
    this.isConnected = true;

    const yokeCount = 4; // TODO: Get this value from the backend from measurement-settings>coil>coiltype
    const sensorCount = 8; // TODO: Get this value from the backend from measurement-settings
    this.yokes.set(Array.from({ length: yokeCount }, () => ({ sensors: Array(sensorCount).fill(0) })));

    this.webSocketService.getMessages().subscribe((message) => {
      console.log('Received message:', message);

      const [topic, value] = message.split(':'); 
      const yokeIndex: number = parseInt(topic.split('S')[1]) - 1;
      const sensorIndex: number = parseInt(topic.split('S')[2]) - 1;
      const sensorValue: number = parseFloat(value);

      //console.log(`Yoke: ${yokeIndex}, Sensor: ${sensorIndex}, Value: ${sensorValue}`);

      //this.yokes[yokeIndex].sensors[sensorIndex] = sensorValue;
      this.yokes.update((prevYokes) => {
        const updatedYokes = [...prevYokes];
        updatedYokes[yokeIndex].sensors[sensorIndex] = sensorValue;
        return updatedYokes;
      });
    });
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