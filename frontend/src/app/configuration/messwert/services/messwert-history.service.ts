import { Injectable } from '@angular/core';
import { Messwert } from '../interfaces/messwert.model';

@Injectable({
  providedIn: 'root'
})
export class MesswertHistoryService {

  getHistoricalData(messwerte: Messwert[], stepsBack: number): Messwert[] {
    if (!messwerte.length) return [];

    const validMesswerte = messwerte.filter(m => 
      m.zeitpunkt && 
      m.sondenPosition && 
      m.sondenPosition.schenkel !== null && 
      m.sondenPosition.position !== null
    );

    const sorted = [...validMesswerte].sort((a, b) => 
      new Date(b.zeitpunkt!).getTime() - new Date(a.zeitpunkt!).getTime()
    );

    const positionGroups = this.groupByProbePosition(sorted);

    const result: Messwert[] = [];
    
    for (const positionKey in positionGroups) {
      const group = positionGroups[positionKey];

      if (stepsBack < group.length) {
        result.push(group[stepsBack]);
      } else if (group.length > 0) {
        result.push(group[group.length - 1]);
      }
    }

    return result;
  }

  getMaxHistorySteps(messwerte: Messwert[]): number {
    if (!messwerte.length) return 0;

    const validMesswerte = messwerte.filter(m => 
      m.zeitpunkt && 
      m.sondenPosition && 
      m.sondenPosition.schenkel !== null && 
      m.sondenPosition.position !== null
    );

    const sorted = [...validMesswerte].sort((a, b) => 
      new Date(b.zeitpunkt!).getTime() - new Date(a.zeitpunkt!).getTime()
    );

    const positionGroups = this.groupByProbePosition(sorted);
    
    let minSteps = Infinity;
    for (const positionKey in positionGroups) {
      minSteps = Math.min(minSteps, positionGroups[positionKey].length);
    }

    const maxAvailableSteps = Math.max(0, minSteps - 1);
    return Math.min(maxAvailableSteps, 9);
  }

  private groupByProbePosition(messwerte: Messwert[]): { [key: string]: Messwert[] } {
    const groups: { [key: string]: Messwert[] } = {};

    messwerte.forEach(messwert => {
      const key = `${messwert.sondenPosition!.schenkel}-${messwert.sondenPosition!.position}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(messwert);
    });

    return groups;
  }
}