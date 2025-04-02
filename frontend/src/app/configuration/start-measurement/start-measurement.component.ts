import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule], 
  providers: [WebSocketService],
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
}
