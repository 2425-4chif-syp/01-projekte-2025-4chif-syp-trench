import { MeasurementProbeType } from "../../measurement-probe-type/interfaces/measurement-probe-type";

export interface MeasurementProbe {
    id: number,
    width: number,
    probeType: MeasurementProbeType,
    probeTypeId: number,
    yoke: number,
    position: number
}