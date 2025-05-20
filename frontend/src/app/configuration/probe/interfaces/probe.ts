import { ProbeType } from "../../probe-type/interfaces/probe-type";

export interface Probe {
    id: number,
    name: string,
    probeType: ProbeType | null,
    probeTypeId: number,
    kalibrierungsfaktor: number | null
}