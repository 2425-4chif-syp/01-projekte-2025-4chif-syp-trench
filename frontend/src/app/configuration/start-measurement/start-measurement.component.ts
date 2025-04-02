import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent {
  sensorValues: { [key: string]: number } = {}; // Speichert Sensorwerte
  isConnected: boolean = false;

  constructor(private webSocketService: WebSocketService) {}

  connectWebSocket(): void {
    this.webSocketService.connect();
    this.isConnected = true;

    this.webSocketService.getMessages().subscribe((message) => {
      const [topic, value] = message.split(':'); // "trench_test/sensor_1:0.5678"
      this.sensorValues[topic] = parseFloat(value);
    });
  }

  getSensorKeys(): string[] {
    return Object.keys(this.sensorValues);
  }
}
