import { Measurement } from "../../measurement-history/interfaces/measurement.model";
import { ProbePosition } from "../../probe-position/interfaces/probe-position.model";

export interface Messwert {
    id: number | null;
    messungID: number | null;
    measurement: Measurement | null;
    sondenPositionID: number | null;
    sondenPosition: ProbePosition | null;
    wert: number | null;
    zeitpunkt: Date | null;
}
