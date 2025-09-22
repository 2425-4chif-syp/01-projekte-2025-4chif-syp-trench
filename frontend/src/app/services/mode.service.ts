import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum UserMode {
  ADMIN = 'admin',
  MONTEUR = 'monteur'
}

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  private currentModeSubject = new BehaviorSubject<UserMode>(UserMode.MONTEUR);
  public currentMode$ = this.currentModeSubject.asObservable();

  constructor() {
    // Lade den gespeicherten Modus aus localStorage oder setze Standard auf Monteur
    const savedMode = localStorage.getItem('userMode');
    if (savedMode && Object.values(UserMode).includes(savedMode as UserMode)) {
      this.currentModeSubject.next(savedMode as UserMode);
    }
  }

  getCurrentMode(): UserMode {
    return this.currentModeSubject.value;
  }

  setMode(mode: UserMode): void {
    this.currentModeSubject.next(mode);
    localStorage.setItem('userMode', mode);
  }

  isAdminMode(): boolean {
    return this.getCurrentMode() === UserMode.ADMIN;
  }

  isMonteurMode(): boolean {
    return this.getCurrentMode() === UserMode.MONTEUR;
  }

  toggleMode(): void {
    const newMode = this.isAdminMode() ? UserMode.MONTEUR : UserMode.ADMIN;
    this.setMode(newMode);
  }
}
