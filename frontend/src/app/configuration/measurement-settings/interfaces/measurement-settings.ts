import { Coil } from "../../coil/interfaces/coil";
import { ProbeType } from "../../probe-type/interfaces/probe-type";

export interface MeasurementSetting{
    id: number | null,
    coil: Coil | null,
    coilId: number | null,
    measurementProbeType: ProbeType | null,
    measurementProbeTypeId: number | null,
    name: string,
    sondenProSchenkel: number | null,
}
