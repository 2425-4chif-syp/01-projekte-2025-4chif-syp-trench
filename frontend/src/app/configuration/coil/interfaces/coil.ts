import { Coiltype } from "../../coiltype/interfaces/coiltype";

export interface Coil {
    id: number | null;
    coiltype: Coiltype | null;
    coiltypeId: number | null;
    ur: number | null;
    einheit: number | null;
    auftragsnummer: number | null;
    auftragsPosNr: number | null;
    omega: number | null;
    notiz: string | null;
}
