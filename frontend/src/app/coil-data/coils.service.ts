import { Injectable } from '@angular/core';
import { Coil } from './coil';

@Injectable({
  providedIn: 'root'
})
export class CoilsService {
  public coils: Coil[] = [];

  constructor() { }

  public addNewCoil():Coil {
    const newId:number = this.coils.map(c => c.id).reduce((a, b) => Math.max(a, b), 0) + 1;
    
    const newCoil:Coil = {
      id: newId,
      name: 'Spule #' + newId,
      diameter: 1,
      arcLength: 1,
      endArea: 1,
      tolerance: 0,
      yokesCount: 2
    };

    this.coils.push(newCoil);

    return newCoil;
  }
}
