import { Coil } from "../../coil/interfaces/coil";
import { MeasurementProbeType } from "../../measurement-probe-type/interfaces/measurement-probe-type";

export interface MeasurementSetting{
    id: number | null,
    coil: Coil | null,
    coilId: number | null,
    measurementProbeType: MeasurementProbeType | null,
    measurementProbeTypeId: number | null,
    name: string,
    sondenProSchenkel: number | null,
}
