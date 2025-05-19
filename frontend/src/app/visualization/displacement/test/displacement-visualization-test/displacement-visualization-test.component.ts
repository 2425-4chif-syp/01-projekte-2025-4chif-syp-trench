import { Component, signal } from '@angular/core';
import { DisplacementVisualizationComponent } from '../../components/displacement-visualization.component';
import { MeasurementProbeType } from '../../../../configuration/measurement-probe-type/interfaces/measurement-probe-type';
import { MeasurementProbe } from '../../../../configuration/measurement-probe/interfaces/measurement-probes';
import { Coil } from '../../../../configuration/coil/interfaces/coil';
import { Coiltype } from '../../../../configuration/coiltype/interfaces/coiltype';
import { MeasurementSetting } from '../../../../configuration/measurement-settings/interfaces/measurement-settings';
import { Measurement } from '../../../../configuration/measurement-history/interfaces/measurement.model';

@Component({
  selector: 'app-displacement-visualization-test',
  standalone: true,
  imports: [DisplacementVisualizationComponent],
  templateUrl: './displacement-visualization-test.component.html',
  styleUrl: './displacement-visualization-test.component.scss'
})
export class DisplacementVisualizationTestComponent {
  yokes = signal<{sensors:number[]}[]>([
    { sensors: [1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7] },
    { sensors: [1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051.0] },
    { sensors: [1161.2, 1423.0, 1744.1, 1807.6, 1472.1, 1139.1] }]);

  probe_type:MeasurementProbeType = {
    id: 0,
    name: "Test-Sondentyp",
    breite: 145,
    hoehe: 45,
    windungszahl: 14,
    notiz: ""
  };

  probe:MeasurementProbe = {
    id: 0,
    name: "Test-Sonde",
    probeType: this.probe_type,
    probeTypeId: 0,
    kalibrierungsfaktor: 1.0
  };

  coiltype:Coiltype = {
    id: 0,
    name: "Test-Spulentyp",
    schenkel: 3,
    bandbreite: 150,
    schichthoehe: 416,
    durchmesser: 550,
    toleranzbereich: 0,
    notiz: ""
  }

  coil:Coil = {
    id: 0,
    coiltype: this.coiltype,
    coiltypeId: 0,
    einheit: 123457890,
    auftragsnummer: 'Instanz',
    auftragsPosNr: 0,
    bemessungsspannung: 900,
    bemessungsfrequenz: 50,
    notiz: ""
  };

  measurementSetting:MeasurementSetting = {
    id: 0,
    name: "Test-Messeinstellung",
    coil: this.coil,
    coilId: 0,
    measurementProbeType: this.probe_type,
    measurementProbeTypeId: 0,
    sondenProSchenkel: 6,
  }

  measurement:Measurement = {
    id: 0,
    measurementSettings: this.measurementSetting,
    measurementSettingsId: 0,
    anfangszeitpunkt: new Date(),
    endzeitpunkt: new Date(),
    name: "Test-Messung",
    tauchkernstellung: 0,
    pruefspannung: 0,
    notiz: ""
  }
}
