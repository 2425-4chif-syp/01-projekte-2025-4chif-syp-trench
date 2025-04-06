import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<string>();
  private isConnected: boolean = false;

  constructor() {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket('ws://localhost:8080/ws');

      this.socket.onopen = () => {
        console.log('WebSocket Verbindung hergestellt');
        this.isConnected = true;
        resolve();
      };

      this.socket.onmessage = (event) => {
        console.log('Nachricht empfangen:', event.data);
        this.messageSubject.next(event.data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Fehler:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket Verbindung geschlossen');
        this.isConnected = false;
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  sendMessage(message: string): void {
    if (this.socket && this.isConnected) {
      console.log('Sende Nachricht:', message);
      this.socket.send(message);
    } else {
      console.error('WebSocket ist nicht verbunden');
    }
  }

  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }
}