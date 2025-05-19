import { Injectable } from '@angular/core';
import { MeasurementProbeType } from '../../configuration/measurement-probe-type/interfaces/measurement-probe-type';
import { MeasurementProbe } from '../../configuration/measurement-probe/interfaces/measurement-probes';
import { Coil } from '../../configuration/coil/interfaces/coil';
import { Coiltype } from '../../configuration/coiltype/interfaces/coiltype';
import { Measurement } from '../../configuration/measurement-history/interfaces/measurement.model';
import { MeasurementSetting } from '../../configuration/measurement-settings/interfaces/measurement-settings';

@Injectable({
  providedIn: 'root',
})
export class DisplacementCalculationService {
  constructor() {}

  // Function to calculate the x and y values of the vectors
  calculateYokeData(yokes: { sensors: number[] }[], measurementProbeType:MeasurementProbeType, measurementProbe:MeasurementProbe, coiltype: Coiltype, coil: Coil, measurementSetting:MeasurementSetting, measurement: Measurement)
    : { x: number; y: number, angle:number, length:number }[] {
    return yokes.map((yoke, index) => {
      // Berechnete Querschnittsfläche in m^2
      const A = measurementProbeType.breite! * measurementProbeType.hoehe! / 1000.0 / 1000.0;

      // Winkelgeschwindigkeit (omega = 2*pi*f)
      const omega = 2 * Math.PI * coil.bemessungsfrequenz!;

      // Spannungswerte umgerechnet auf magnetischen Fluss (in µVs)
      const psi: { sensors: number[] }[] = yokes.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          (sensor / omega * 1000))
      }));

      // Fluss umgerechnet auf Induktion (in mT)
      const B_peak: { sensors: number[] }[] = psi.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          (sensor * 0.000001 / A / measurementProbeType.windungszahl! * 1000 * Math.SQRT2))
      }));

      return { x: 0, y: 0, angle: 0, length: 0 };
    });
  }
}
