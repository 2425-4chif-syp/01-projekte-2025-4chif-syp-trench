import { Injectable } from '@angular/core';
import { Coil } from '../../configuration/coil/interfaces/coil';
import { Coiltype } from '../../configuration/coiltype/interfaces/coiltype';
import { MeasurementSetting } from '../../configuration/measurement-settings/interfaces/measurement-settings';
import { Probe } from '../../configuration/probe/interfaces/probe';
import { ProbeType } from '../../configuration/probe-type/interfaces/probe-type';
import { Measurement } from '../../configuration/measurement-history/interfaces/measurement.model';

@Injectable({
  providedIn: 'root',
})

// TODO:
// Ur aus der Excel -> Eingabefeld? (nicht im ERD)
// delta_ang aus der Excel -> Hier steht, das kann aus den gegebenen Werten berechnet werden - wie geht das?
// Berechnung von angle -> Was ist, wenn es eine ungerade Anzahl an Sonden pro Joch gibt?
// Sondenkalibrierung wird noch nicht berücksichtigt
export class DisplacementCalculationService {
  constructor() {}
  public static getAngleLookup(yokeCount: number): number[] {
    switch (yokeCount) {
      case 2:
        return [0, 180]; 
      case 3:
        return [0, 120, 240];
      case 4:
        return [90, 180, 270, 0];
    }
    throw new Error('Invalid yoke count: ' + yokeCount);
  }

  // Function to calculate the x and y values of the vectors and the total force in kg
  calculateYokeData(yokes: { sensors: number[] }[], probeType:ProbeType, probes:Probe[], coiltype: Coiltype, coil: Coil, measurementSetting:MeasurementSetting, pruefspannung:number)
    : {F: { x: number; y: number }[][], m_tot:number} {
    // Berechnete Querschnittsfläche in m^2
    const A = probeType.breite! * probeType.hoehe! / 1000.0 / 1000.0;

    // Winkelgeschwindigkeit (omega = 2*pi*f)
    const omega = 2 * Math.PI * coil.bemessungsfrequenz!;

    // Spannungswerte umgerechnet auf magnetischen Fluss (in µVs)
    const psi: { sensors: number[] }[] = yokes.map(yoke => ({
      sensors: yoke.sensors.map(sensor => 
        (sensor / omega * 1000))
    }));

    console.log('psi:', psi);

    // Fluss umgerechnet auf Induktion (in mT)
    const B_peak: { sensors: number[] }[] = psi.map(yoke => ({
      sensors: yoke.sensors.map(sensor => 
        (sensor * 0.000001 / A / probeType.windungszahl! * 1000 * Math.SQRT2))
    }));

    console.log('B_peak:', B_peak);

    // Induktion umgerechnet auf Nennbedingungen * 115%
    const B_peak_nom: { sensors: number[] }[] = B_peak.map(yoke => ({
      sensors: yoke.sensors.map(sensor => 
        (sensor / pruefspannung * coil.bemessungsspannung! / 1000 * 1.15))
    }));

    console.log('B_peak_nom:', B_peak_nom);

    // Vs/A/m
    const µ0 = 4 * Math.PI * Math.pow(10.0,-7);

    // F = B^2 * A / 2 / µ0
    const F_testarea: { sensors: number[] }[] = B_peak_nom.map(yoke => ({
      sensors: yoke.sensors.map(sensor => 
        ((sensor * sensor) / µ0 / 2 * A))
    }));

    const A_IJ = (coiltype.durchmesser! * Math.PI * coiltype.bandbreite! / 3) / 1000.0 / 1000;

    // Füllfaktor - Gibt an, wieviel der Fläche durch die Messsonden erfasst wird um die Kraft skalieren zu können
    const FF_area = 6 * A / A_IJ;

    // Skalierte Kraft aus Füllfaktor und F_testarea
    const F_skal: { sensors: number[] }[] = F_testarea.map(yoke => ({
      sensors: yoke.sensors.map(sensor => 
        (sensor / FF_area))
    }));

    // Winkel der Normale auf die Messfläche ergibt sich aus Anzahl der Sonden und Gerätetype
    if (measurementSetting.sondenProSchenkel! < 1) {
      throw new Error('Invalid number of sensors per yoke (must be >=1): ' + measurementSetting.sondenProSchenkel);
    }
    const angleLookup = DisplacementCalculationService.getAngleLookup(yokes.length);
    const angle: { sensors: number[] }[] = [];
    for (let i = 0; i < yokes.length; i++) {
      let sensors: number[] = new Array(yokes[i].sensors.length);

      const center = Math.floor(yokes[i].sensors.length / 2);
      let centerLeft:number;
      let centerRight:number;

      if (yokes[i].sensors.length % 2 == 0) { // even
        // Sonden in der Mitte
        centerLeft = center - 1;
        centerRight = center;
        sensors[center - 1] = angleLookup[i] - probeType.alpha! / 2;
        sensors[center] = angleLookup[i] + probeType.alpha! / 2;
      }
      else { // odd
        centerLeft = center;
        centerRight = center;
        sensors[center] = 0;
      }

      // Erste Hälfte der Sonden (bei 6 ist das Index 2->0)
      for (let ii = centerLeft; ii >= 0; ii--) {
        sensors[ii] = sensors[ii + 1] - probeType.alpha!;
      }

      // Zweite Hälfte der Sonden (bei 6 ist das Index 5->3)
      for (let ii = centerRight + 1; ii < yokes[i].sensors.length; ii++) {
        sensors[ii] = sensors[ii - 1] + probeType.alpha!;
      }

      angle.push({ sensors: sensors });
    }

    // Kraftkomponenten in x und y
    const F: { sensors: {x:number, y:number}[] }[] = yokes.map((yoke, i) => ({
      sensors: yoke.sensors.map((_, ii) =>
        ({
          x: F_skal[i].sensors[ii] * Math.cos(angle[i].sensors[ii] * Math.PI / 180),
          y: F_skal[i].sensors[ii] * Math.sin(angle[i].sensors[ii] * Math.PI / 180)
        })
      )
    }));

    // Werte gruppiert nach Schenkel zurückgeben
    const result: { x: number; y: number }[][] = [];
    for (let i = 0; i < yokes.length; i++) {
      const yoke = yokes[i];
      const yokeResult: { x: number; y: number }[] = [];
      for (let ii = 0; ii < yoke.sensors.length; ii++) {
        yokeResult.push(F[i].sensors[ii]);
      }
      result.push(yokeResult);
    }

    // Summenkraft in N
    const F_tot_vec: { x: number; y: number } = { x: 0, y: 0 };
    for (let i = 0; i < yokes.length; i++) {
      for (let ii = 0; ii < yokes[i].sensors.length; ii++) {
        F_tot_vec.x += F[i].sensors[ii].x;
        F_tot_vec.y += F[i].sensors[ii].y;
      }
    }

    // Summenkraft in kg
    const m_tot_vec: { x: number; y: number } = {
      x: F_tot_vec.x / 9.81,
      y: F_tot_vec.y / 9.81
    };

    // Absolutwert der Summenkraft in kg
    const m_tot:number = Math.sqrt(m_tot_vec.x * m_tot_vec.x + m_tot_vec.y * m_tot_vec.y);
    
    return {
      F: result,
      m_tot: m_tot
    };
  }
}