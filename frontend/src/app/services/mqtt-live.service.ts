import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';
import { environment } from '../../environments/environment';

export type LiveSensorValue = {
  sensorKey: string;
  value: number;
  receivedAt: Date;
  topic: string;
};

@Injectable({ providedIn: 'root' })
export class MqttLiveService {
  private client: MqttClient | null = null;
  private readonly connectedSubject = new BehaviorSubject<boolean>(false);
  private readonly lastErrorSubject = new BehaviorSubject<string | null>(null);
  private readonly valuesSubject = new BehaviorSubject<Record<string, LiveSensorValue>>({});

  public readonly connected$: Observable<boolean> = this.connectedSubject.asObservable();
  public readonly lastError$: Observable<string | null> = this.lastErrorSubject.asObservable();
  public readonly values$: Observable<Record<string, LiveSensorValue>> = this.valuesSubject.asObservable();

  constructor(private zone: NgZone) {}

  public connect(): void {
    if (this.client) return;

    const url = environment.mqttWsUrl;
    const topic = environment.mqttTopic;
    const username = (environment as any).mqttUsername as string | undefined;
    const password = (environment as any).mqttPassword as string | undefined;

    this.lastErrorSubject.next(null);

    try {
      this.client = mqtt.connect(url, {
        reconnectPeriod: 2000,
        connectTimeout: 5000,
        clean: true,
        ...(username ? { username } : {}),
        ...(password ? { password } : {}),
      });

      this.client.on('connect', () => {
        this.zone.run(() => {
          this.connectedSubject.next(true);
          this.lastErrorSubject.next(null);
        });
        this.client?.subscribe(topic, { qos: 2 });
      });

      this.client.on('reconnect', () => {
        this.zone.run(() => this.connectedSubject.next(false));
      });

      this.client.on('close', () => {
        this.zone.run(() => this.connectedSubject.next(false));
      });

      this.client.on('error', (err) => {
        this.zone.run(() => this.lastErrorSubject.next(err?.message ?? String(err)));
      });

      this.client.on('message', (incomingTopic, payload) => {
        const sensorKey = parseSensorKeyFromTopic(incomingTopic);
        const value = parseValue(payload);
        if (!sensorKey || value == null) return;

        const nextValue: LiveSensorValue = {
          sensorKey,
          value,
          receivedAt: new Date(),
          topic: incomingTopic,
        };

        this.zone.run(() => {
          const current = this.valuesSubject.value;
          this.valuesSubject.next({
            ...current,
            [sensorKey]: nextValue,
          });
        });
      });
    } catch (e) {
      this.lastErrorSubject.next(e instanceof Error ? e.message : String(e));
    }
  }

  public disconnect(): void {
    const c = this.client;
    this.client = null;
    this.connectedSubject.next(false);
    if (!c) return;

    try {
      c.end(true);
    } catch {
      // ignore
    }
  }
}

function parseSensorKeyFromTopic(topic: string): string | null {
  const parts = topic.split('/').filter(Boolean);

  const direct = parts[parts.length - 1] ?? '';
  if (/^S\d+S\d+$/i.test(direct)) return direct.toUpperCase();

  let rjNum: number | null = null;
  let probeNum: number | null = null;

  for (const part of parts) {
    if (rjNum == null && /^rj\d+$/i.test(part)) rjNum = Number(part.slice(2));
    if (probeNum == null && /^probe\d+$/i.test(part)) probeNum = Number(part.slice(5));
  }

  if (rjNum == null || probeNum == null || Number.isNaN(rjNum) || Number.isNaN(probeNum)) return null;
  return `S${rjNum}S${probeNum}`;
}

function parseValue(payload: Uint8Array): number | null {
  if (!payload || payload.length === 0) return null;

  // Mock sends 16 bytes with float32 at offset 0 (little-endian)
  if (payload.length >= 4) {
    const dv = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    const asFloat = dv.getFloat32(0, true);
    if (Number.isFinite(asFloat)) return asFloat;
  }

  // Fallback for JSON/text payloads
  try {
    const text = new TextDecoder().decode(payload).trim();
    if (!text) return null;
    const asNum = Number(text);
    if (Number.isFinite(asNum)) return asNum;
    const obj = JSON.parse(text);
    if (typeof obj === 'number' && Number.isFinite(obj)) return obj;
    if (obj && typeof obj.value === 'number' && Number.isFinite(obj.value)) return obj.value;
  } catch {
    // ignore
  }

  return null;
}
