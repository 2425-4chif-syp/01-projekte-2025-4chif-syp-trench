import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  id: number;
  type: AlertType;
  title?: string;
  message: string;
  details?: string;
  autoClose?: boolean;
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  private counter = 0;

  success(message: string, opts?: Partial<Alert>) {
    return this.push({
      type: 'success',
      message,
      autoClose: true,
      timeoutMs: 3000,
      ...opts
    });
  }

  error(message: string, err?: unknown, opts?: Partial<Alert>) {
    const details = this.extractErrorDetails(err);
    return this.push({ type: 'danger', message, details, autoClose: false, ...opts });
  }

  info(message: string, opts?: Partial<Alert>) {
    return this.push({ type: 'info', message, autoClose: false, ...opts });
  }

  warning(message: string, opts?: Partial<Alert>) {
    return this.push({ type: 'warning', message, autoClose: false, ...opts });
  }

  close(id: number) {
    const next = this.alertsSubject.value.filter(a => a.id !== id);
    this.alertsSubject.next(next);
  }

  clear() {
    this.alertsSubject.next([]);
  }

  private push(alert: Omit<Alert, 'id'>) {
    const id = ++this.counter;
    const full: Alert = { id, ...alert };
    const next = [...this.alertsSubject.value, full];
    this.alertsSubject.next(next);

    if (full.autoClose) {
      const timeout = full.timeoutMs ?? 3000;
      setTimeout(() => this.close(id), timeout);
    }
    return id;
  }

  private extractErrorDetails(err: unknown): string | undefined {
    if (!err) return undefined;
    // HttpErrorResponse like
    const anyErr: any = err as any;
    if (typeof anyErr === 'object') {
      const parts: string[] = [];
      if (anyErr.status != null) parts.push(`Status: ${anyErr.status}`);
      if (anyErr.statusText) parts.push(anyErr.statusText);
      if (anyErr.name && anyErr.name !== 'HttpErrorResponse') parts.push(anyErr.name);
      if (anyErr.message) parts.push(anyErr.message);
      try {
        const payload = anyErr.error ?? anyErr.body;
        if (payload && typeof payload === 'object') {
          const asText = JSON.stringify(payload);
          if (asText && asText.length < 500) parts.push(asText);
        } else if (typeof payload === 'string') {
          parts.push(payload);
        }
      } catch (_) {
        // ignore serialization issues
      }
      return parts.filter(Boolean).join(' · ');
    }
    if (typeof anyErr === 'string') return anyErr;
    return undefined;
  }
}

