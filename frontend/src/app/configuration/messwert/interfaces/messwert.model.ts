import { Measurement } from "../../measurement-history/interfaces/measurement.model";
import { ProbePosition } from "../../probe-position/interfaces/probe-position.model";

export interface Messwert {
    id: number | null;
    measurement_id: number | null;
    measurement: Measurement | null;
    measurementProbePositionId: number | null;
    measurementProbePosition: ProbePosition | null;
    wert: number | null;
    zeitpunkt: Date | null;
}
