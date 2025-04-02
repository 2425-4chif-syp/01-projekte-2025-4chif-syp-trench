import { Coil } from "../../coil-data/coil"
import { MeasurementProbeType } from "../../measurement-probes/measurement-probe-type"

export interface MeasurementSetting{
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