import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket?: WebSocket;
  private messagesSubject = new Subject<string>();

  connect(): void {
    this.socket = new WebSocket('ws://localhost:8080/ws'); // HTTP für lokale Entwicklung

    this.socket.onopen = () => {
      console.log('WebSocket Verbindung hergestellt');
    };

    this.socket.onmessage = (event) => {
      this.messagesSubject.next(event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket Verbindung geschlossen');
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  getMessages(): Observable<string> {
    return this.messagesSubject.asObservable();
  }
}
