import { Coil } from "../../coil/interfaces/coil";
import { MeasurementProbeType } from "../../measurement-probe-type/interfaces/measurement-probe-type";

export interface MeasurementSettings{
    coil: Coil | null,
    coilId: number | null,
    measurementProbeType: MeasurementProbeType | null,
    measurementProbeTypeId: number | null,
    wicklungszahl: number | null,
    bemessungsspannung: number | null,
    bemessungsfrequenz: number | null,
    sondenProSchenkel: number | null,
    notiz: string | null,
}