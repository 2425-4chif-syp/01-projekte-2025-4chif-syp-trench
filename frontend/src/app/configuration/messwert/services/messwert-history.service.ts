import { Injectable } from "@angular/core";
import { Messwert } from "../interfaces/messwert.model";

@Injectable({
    providedIn: 'root'
})
export class MesswertHistoryService {

    getHistoricalData(messwerte: Messwert[], stepsBack: number): Messwert[] {

        return []
    }

    getMaxHistorySteps(messwerte: Messwert[]): number {

        return 0
    }

    private groupByProbePosition(messwerte: Messwert[]): { [key: string]: Messwert[] } {
        const groups: { [key: string]: Messwert[] } = {};

        return groups
    }
}