import { Injectable } from "@angular/core";
import { Messwert } from "../interfaces/messwert.model";

@Injectable({
    providedIn: 'root'
})
export class MesswertHistoryService {

    getHistoricalData(messwerte: Messwert[], stepsBack: number): Messwert[] {
        if (!messwerte.length) {
            return []
        }

        const validMesswerte = messwerte.filter(mw =>
            mw.zeitpunkt &&
            mw.sondenPosition &&
            mw.sondenPosition.schenkel !== null &&
            mw.sondenPosition.position !== null
        );

        const sortedMesswerte = [...validMesswerte].sort((a, b) =>
            new Date(b.zeitpunkt!).getTime() - new Date(a.zeitpunkt!).getTime()
        );

        const positionGroups = this.groupByProbePosition(sortedMesswerte);

        const result: Messwert[] = [];

        for (const positionKey in positionGroups) {
            const group = positionGroups[positionKey];

            if (group.length > stepsBack) {
                result.push(group[stepsBack]);
            } else if (group.length > 0) {
                result.push(group[group.length - 1]);
            }
        }

        return result;
    }

    getMaxHistorySteps(messwerte: Messwert[]): number {
        if (!messwerte.length) {
            return 0;
        }

        const validMesswerte = messwerte.filter(m => 
            m.zeitpunkt && 
            m.sondenPosition && 
            m.sondenPosition.schenkel !== null && 
            m.sondenPosition.position !== null
        );

        const sortedMesswerte = [...validMesswerte].sort((a, b) => 
            new Date(b.zeitpunkt!).getTime() - new Date(a.zeitpunkt!).getTime()
        );

        const positionGroups = this.groupByProbePosition(sortedMesswerte);
        
        // Find the maximum number of historical entries across all positions
        let maxSteps = 0;
        for (const positionKey in positionGroups) {
            maxSteps = Math.max(maxSteps, positionGroups[positionKey].length);
        }

        // Limit to maximum 10 steps
        return Math.min(maxSteps, 10);
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