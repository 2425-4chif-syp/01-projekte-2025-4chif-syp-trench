import { MeasurementSetting } from "../../measurement-settings/interfaces/measurement-settings";
import { Probe } from "../../probe/interfaces/probe";

export interface ProbePosition {
    id: number | null;
    measurementSettingsId: number | null;
    measurementSetting: MeasurementSetting | null;
    measurementProbeId: number | null;
    measurementProbe: Probe | null;
    schenkel: number | null;
    position: number | null;
}
