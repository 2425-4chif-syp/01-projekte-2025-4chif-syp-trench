import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import mqtt from 'mqtt';

@Component({
  selector: 'app-measurement-management',
  standalone: true,
  imports: [CommonModule, FormsModule] as const,
  templateUrl: './measurement-management.component.html',
  styleUrl: './measurement-management.component.scss'
})
export class MeasurementManagementComponent implements OnInit, OnDestroy {
  public hasConnected: boolean = false;
  public sensorValues: { [key: string]: number } = {}; // Store sensor values
  public lastUpdate: Date | undefined = undefined;

  private client!: mqtt.MqttClient;

  constructor() {}

  ngOnInit(): void {
    const host = 'vm90.htl-leonding.ac.at';
    const username = 'student';
    const password = 'passme';
    const baseTopic = 'trench_test/#';

    this.client = mqtt.connect(`ws://${host}:9001/ws`, {
      username: username,
      password: password
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');

      this.client.subscribe(baseTopic, { qos: 1 }, (err: any, granted: any) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log(`Subscribed to topic: ${baseTopic}`);
          this.hasConnected = true;
        }
      });
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      try {
        const sensorKey = topic.split('/').pop()!;

        const sensorValue = parseFloat(message.toString());

        this.sensorValues[sensorKey] = sensorValue;

        this.lastUpdate = new Date();

        console.log(`Received value for ${sensorKey}:`, sensorValue);
      } catch (error) {
        console.error('Failed to process message:', error);
      }
    });

    this.client.on('error', (err: any) => {
      console.error('MQTT connection error:', err);
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
    });
  }

  ngOnDestroy(): void {
    this.client.end();
  }

  getSensorKeys(): string[] {
    return Object.keys(this.sensorValues);
  }
}
