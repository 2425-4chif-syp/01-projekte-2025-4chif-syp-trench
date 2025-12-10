import { MeasurementSetting } from "../../measurement-settings/interfaces/measurement-settings";

export interface Measurement {
    id: number | null,
    messeinstellung: MeasurementSetting | null,
    messeinstellungId: number | null,
    anfangszeitpunkt: Date | null,
    endzeitpunkt: Date | null,
    name: string | null,
    tauchkernstellung: number | null,
    pruefspannung: number | null,
    notiz: string | null,
}
