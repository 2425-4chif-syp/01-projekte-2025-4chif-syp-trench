import { Coiltype } from "../coiltype-data/coiltype";

export interface Coil {
    id: number | null;
    coiltype: Coiltype | null;
    coiltypeId: number | null;
    ur: number | null;
    einheit: number | null;
    auftragsnummer: number | null;
    auftragsPosNr: number | null;
    omega: number | null;
}
