import { Coiltype } from "../../coiltype/interfaces/coiltype";

export interface Coil {
    id: number | null;
    coiltype: Coiltype | null;
    coiltypeId: number | null;
    einheit: number | null;
    auftragsnummer: string | null;
    auftragsPosNr: number | null;
    bemessungsspannung: number | null;
    bemessungsfrequenz: number | null;
    notiz: string | null;
}
