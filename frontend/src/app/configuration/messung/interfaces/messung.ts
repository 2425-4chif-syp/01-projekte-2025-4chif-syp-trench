import { MeasurementSetting } from "../../measurement-settings/interfaces/measurement-settings";

export interface Messung {
    id: number | null,
    name: string | null,
    messeinstellung: MeasurementSetting | null,
    messeinstellungId: number | null,
    anfangszeitpunkt: Date | null,
    endzeitpunkt: Date | null,
    tauchkernstellung: number | null,
    pruefspannung: number | null,
    notiz: string | null,
}
