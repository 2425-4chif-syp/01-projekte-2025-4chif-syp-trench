import { Injectable } from '@angular/core';
import { Coil } from './coil';

@Injectable({
  providedIn: 'root'
})
export class CoilsService {
  public coils: Coil[] = [];

  constructor() { }
}
