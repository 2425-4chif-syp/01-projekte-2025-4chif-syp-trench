import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import mqtt from 'mqtt';
import {JsonPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-measurement-management',
  standalone: true,
  imports: [FormsModule, JsonPipe, NgIf],
  templateUrl: './measurement-management.component.html',
  styleUrl: './measurement-management.component.scss'
})
export class MeasurementManagementComponent implements OnInit, OnDestroy {
  public hasConnected:boolean = false;
  public json:string|undefined = undefined;
  private client!: mqtt.MqttClient;

  constructor() {}

  ngOnInit(): void {
    const host = 'vm90.htl-leonding.ac.at';
    const username = 'student';
    const password = 'passme';
    const topic = 'SmartHome/Sun_Power/Data_json';

    this.client = mqtt.connect(`ws://${host}:9001/ws`, {
      username: username,
      password: password
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Subscribe to the updated topic SmartHome/Sun_Power
      this.client.subscribe(topic, { qos: 1 }, (err:any, granted:any) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log(`Subscribed to topic: `, topic);
          this.hasConnected = true;
        }
      });
    });

    this.client.on('message', (topic: any, message: any) => {
      try {
        // The message should contain a JSON string directly
        const messageData = JSON.parse(message.toString());

        // Display the received JSON data in the div
        console.log('Received Data_json:', messageData);
        
        this.json = JSON.stringify(messageData, null, 2);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    this.client.on('error', (err:any) => {
      console.error('MQTT connection error:', err);
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
    });
  }

  ngOnDestroy(): void {
    // Close the MQTT connection when the component is destroyed
    this.client.end();
  }
}
