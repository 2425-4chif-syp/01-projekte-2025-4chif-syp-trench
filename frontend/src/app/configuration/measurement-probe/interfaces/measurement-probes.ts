import { MeasurementProbeType } from "../../measurement-probe-type/interfaces/measurement-probe-type";

export interface MeasurementProbe {
    id: number,
    name: string,
    probeType: MeasurementProbeType,
    probeTypeId: number,
    kalibrierungsfaktor: number | null,
}