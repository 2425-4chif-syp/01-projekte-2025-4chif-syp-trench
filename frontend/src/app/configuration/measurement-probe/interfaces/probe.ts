import { MeasurementProbeType } from "../../measurement-probe-type/interfaces/measurement-probe-type";

export interface Probe {
    id: number,
    name: string,
    probeType: MeasurementProbeType | null,
    probeTypeId: number,
    kalibrierungsfaktor: number | null
}