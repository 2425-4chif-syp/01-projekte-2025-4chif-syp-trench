import { MeasurementProbe } from "../../measurement-probe/interfaces/measurement-probes";
import { MeasurementSetting } from "../../measurement-settings/interfaces/measurement-settings";

export interface MeasurementProbePosition {
    id: number | null;
    measurementSettingsId: number | null;
    measurementSetting: MeasurementSetting | null;
    measurementProbeId: number | null;
    measurementProbe: MeasurementProbe | null;
    schenkel: number | null;
    position: number | null;
}
