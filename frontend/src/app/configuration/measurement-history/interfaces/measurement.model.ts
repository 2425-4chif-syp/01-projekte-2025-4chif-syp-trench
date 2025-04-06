import { MeasurementSetting } from "../../measurement-settings/interfaces/measurement-settings";

export interface Measurement {
    id: number | null,
    measurementSettings: MeasurementSetting | null,
    measurementSettingsId: number | null,
    startTime: Date | null,
    endTime: Date | null,
    notiz: string | null,
}
