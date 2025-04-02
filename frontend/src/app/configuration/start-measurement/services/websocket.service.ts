import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private messages$: Subject<string> = new Subject();

  constructor() {}

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return; // Schon verbunden
    }

    this.socket = new WebSocket('ws://localhost:5127/ws'); // WebSocket-URL vom Backend

    this.socket.onopen = () => {
      console.log('WebSocket verbunden!');
    };

    this.socket.onmessage = (event) => {
      console.log('Nachricht empfangen:', event.data);
      this.messages$.next(event.data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket-Fehler:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket geschlossen.');
    };
  }

  getMessages(): Observable<string> {
    return this.messages$.asObservable();
  }
}
