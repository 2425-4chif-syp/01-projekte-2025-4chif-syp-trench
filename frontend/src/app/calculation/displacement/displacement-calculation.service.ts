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

// TODO:
// Ur aus der Excel -> Eingabefeld? (nicht im ERD)
// delta_ang aus der Excel -> Hier steht, das kann aus den gegebenen Werten berechnet werden - wie geht das?
// Berechnung von angle -> Wie sehen die Zahlen links für 2 Jochs aus? 
// Berechnung von angle -> Was ist, wenn es eine ungerade Anzahl an Sonden pro Joch gibt?
export class DisplacementCalculationService {
  constructor() {}

  // false: A_JI = Bandbreite * Schichthoehe
  // true:  A_JI = Durchmesser * Pi * Bandbreite / 3
  private readonly alternativeBerechnungVonA_JI:boolean = false;

  private readonly Ur = 21000 / Math.sqrt(3);
  private readonly delta_ang = 15.5;

  private getAngleLookup(yokeCount: number): number[] {
    switch (yokeCount) {
      case 2:
        return [0, 180]; // Nur eine Schätzung
      case 3:
        return [0, -120, 120];
      case 4:
        return [0, 90, 180, 270];
    }
    throw new Error('Invalid yoke count: ' + yokeCount);
  }

  // Function to calculate the x and y values of the vectors
  calculateYokeData(yokes: { sensors: number[] }[], measurementProbeType:MeasurementProbeType, measurementProbe:MeasurementProbe, coiltype: Coiltype, coil: Coil, measurementSetting:MeasurementSetting, measurement: Measurement)
    : { x: number; y: number, angle:number, length:number }[][] {
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

      // Induktion umgerechnet auf Nennbedingungen * 115%
      const B_peak_nom: { sensors: number[] }[] = B_peak.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          (sensor / coil.bemessungsspannung! * this.Ur / 1000 * 1.15))
      }));

      // Vs/A/m
      const µ0 = 4 * Math.PI * Math.pow(10.0,-7);

      // F = B^2 * A / 2 / µ0
      const F_testarea: { sensors: number[] }[] = B_peak_nom.map(yoke => ({
        sensors: yoke.sensors.map(sensor => 
          ((sensor * sensor) / µ0 / 2 * A))
      }));

      const A_JI = this.alternativeBerechnungVonA_JI ?
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
      if (measurementSetting.sondenProSchenkel! < 4 || measurementSetting.sondenProSchenkel! % 2 != 0) {
        throw new Error('Invalid number of sensors per yoke (must be >=4 and even): ' + measurementSetting.sondenProSchenkel);
      }
      const angleLookup = this.getAngleLookup(yokes.length);
      let angle: { sensors: number[] }[] = [];
      for (let i = 0; i < yokes.length; i++) {
        let sensors: number[] = new Array(yokes[i].sensors.length);

        const center = Math.floor(yokes[i].sensors.length / 2);

        // Sonden in der Mitte
        sensors[center - 1] = angleLookup[i] - this.delta_ang / 2;
        sensors[center] = angleLookup[i] + this.delta_ang / 2;

        // Erste Hälfte der Sonden (bei 6 ist das Index 2->0)
        for (let ii = center - 2; ii >= 0; ii--) {
          sensors[ii] = sensors[ii + 1] - this.delta_ang;
        }

        // Zweite Hälfte der Sonden (bei 6 ist das Index 5->3)
        for (let ii = center + 1; ii < yokes[i].sensors.length; ii++) {
          sensors[ii] = sensors[ii - 1] + this.delta_ang;
        }

        angle.push({ sensors: sensors });
      }

      // Kraftkomponenten in x und y
      let F: { sensors: number[] }[] = [];
      F = yokes.map((yoke, i) => ({
        sensors: yoke.sensors.map((_, ii) =>
          F_skal[i].sensors[ii] * Math.cos(angle[i].sensors[ii] * Math.PI / 180)
        )
      }));

      return F.map((f, i) => {
        const yokeAngle = angle[i].sensors.map(a => a * Math.PI / 180);
        const yokeLength = f.sensors.map((f, j) => {
          return Math.sqrt(f * f + F_skal[i].sensors[j] * F_skal[i].sensors[j]);
        });

        // Berechnung der x und y Komponenten
        const x = f.sensors.map((f, j) => f * Math.cos(yokeAngle[j]));
        const y = f.sensors.map((f, j) => f * Math.sin(yokeAngle[j]));

        return {
          x: x.reduce((acc, val) => acc + val, 0),
          y: y.reduce((acc, val) => acc + val, 0),
          angle: angle[i].sensors[0],
          length: yokeLength.reduce((acc, val) => acc + val, 0)
        };
      });
    });
  }
}
