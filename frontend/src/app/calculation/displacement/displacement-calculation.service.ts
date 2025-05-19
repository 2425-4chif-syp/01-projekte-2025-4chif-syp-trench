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

  // false: A_JI = Bandbreite * Schichthoehe
  // true:  A_JI = Durchmesser * Pi * Bandbreite / 3
  private static readonly alternativeBerechnungVonA_JI:boolean = false;

  // Function to calculate the x and y values of the vectors
  calculateYokeData(yokes: { sensors: number[] }[], measurementProbeType:MeasurementProbeType, measurementProbe:MeasurementProbe, coiltype: Coiltype, coil: Coil, measurementSetting:MeasurementSetting, measurement: Measurement)
    : { x: number; y: number, angle:number, length:number }[] {
    return yokes.map((yoke, index) => {
      // TODO:
      // Ur aus der Excel -> Eingabefeld? (nicht im ERD)
      // delta_ang aus der Excel -> Hier steht, das kann aus den gegebenen Werten berechnet werden - wie geht das?
      const Ur = 21000 / Math.sqrt(3);
      const delta_ang = 15.5;

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

      // Induktion umgerechnet auf Nennbedingungen * 115%
      const B_peak_nom: { sensors: number[] }[] = B_peak.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          (sensor / coil.bemessungsspannung! * Ur / 1000 * 1.15))
      }));

      // Vs/A/m
      const µ0 = 4 * Math.PI * Math.pow(10.0,-7);

      // F = B^2 * A / 2 / µ0
      const F_testarea: { sensors: number[] }[] = B_peak_nom.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          ((sensor * sensor) / µ0 / 2 * A))
      }));

      const A_JI = DisplacementCalculationService.alternativeBerechnungVonA_JI ?
        (coiltype.durchmesser! * Math.PI * coiltype.bandbreite! / 3) :
        (coiltype.bandbreite! * coiltype.schichthoehe!);

      // Füllfaktor - Gibt an, wieviel der Fläche durch die Messsonden erfasst wird um die Kraft skalieren zu können
      const FF_area = 6 * A / A_JI;

      // Skalierte Kraft aus Füllfaktor und F_testarea
      const F_skal: { sensors: number[] }[] = F_testarea.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          (sensor / FF_area))
      }));

      // Winkel der Normale auf die Messfläche ergibt sich aus Anzahl der Sonden und Gerätetype

      return { x: 0, y: 0, angle: 0, length: 0 };
    });
  }
}
