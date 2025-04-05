import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import mqtt from 'mqtt';
import { RouterModule } from '@angular/router';

interface SensorTolerance {
  name: string;
  greenMax: number;
  yellowMax: number;
}

@Component({
  selector: 'app-mqtt-measurement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule] as const,
  templateUrl: './mqtt-measurement.component.html',
  styleUrl: './mqtt-measurement.component.scss'
})
export class MQTTMeasurementComponent implements OnInit, OnDestroy {
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

  getBackgroundColor(value: number, sensorName: string): string {
    const tolerances = JSON.parse(localStorage.getItem('sensorTolerances') || '[]') as SensorTolerance[];
    const fullSensorName = `trench_test/${sensorName}`;
    const sensorTolerance = tolerances.find(t => t.name === fullSensorName);

    if (!sensorTolerance) {
      if (value >= 0 && value <= 0.4) return 'green';
      else if (value > 0.4 && value <= 0.7) return 'yellow';
      else if (value > 0.7 && value <= 1) return 'red';
      return 'gray';
    }

    // Anwenden der benutzerdefinierten Toleranzwerte
    if (value >= 0 && value <= sensorTolerance.greenMax) return 'green';
    if (value > sensorTolerance.greenMax && value <= sensorTolerance.yellowMax) return 'yellow';
    if (value > sensorTolerance.yellowMax && value <= 1) return 'red';
    return 'gray';
  }
}
