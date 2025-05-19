import { Measurement } from "../../measurement-history/interfaces/measurement.model";
import { MeasurementProbePosition } from "../../measurement-probe-position/interfaces/measurement-probe-position.model";

export interface Messwert {
    id: number | null;
    measurement_id: number | null;
    measurement: Measurement | null;
    measurementProbePositionId: number | null;
    measurementProbePosition: MeasurementProbePosition | null;
    wert: number | null;
    zeitpunkt: Date | null;
}
