import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';
import { Router } from '@angular/router';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete-modal/confirm-delete-modal.component';
import { MessungDetailAuswertungComponent } from './auswertung/messung-detail-auswertung/messung-detail-auswertung.component';
import { Measurement } from '../../measurement-history/interfaces/measurement.model';
import { DisplacementCalculationService } from '../../../calculation/displacement/displacement-calculation.service';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';

// Small helper to coerce possible string timestamps into Date
function asDate(d: any): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteModalComponent, MessungDetailAuswertungComponent],
  templateUrl: './messung-detail.component.html',
  styleUrl: './messung-detail.component.scss'
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService,
    private router: Router,
    private displacementCalculation: DisplacementCalculationService,
    private measurementSettingsService: MeasurementSettingsService) {}

  measurement: Measurement | null = null;
  messwerte = signal<Messwert[]>([]);
  showDeleteModal: boolean = false;

  yokes = signal<{ sensors: number[] }[]>([]);
  yokeData = signal<{ x: number; y: number }[][]>([]);
  m_tot = signal<number>(0);

  // Slider state: milliseconds since epoch
  sliderMinMs: number = 0;
  sliderMaxMs: number = 0;
  sliderValue = signal<number>(0);

  // selected time as Date (signal for template access if needed)
  selectedTime = signal<Date | null>(null);

  async ngOnInit(): Promise<void> {
    this.measurement = this.messungService.clickedMessung;
    await this.ensureMeasurementDetails();
    await this.loadMesswerte();
  }

  /**
   * Ensure that measurement has full nested data (messeinstellung, coil and coiltype).
   * If any of those are missing, reload the full measurement from the backend via MessungService.
   */
  private async ensureMeasurementDetails(): Promise<void> {
    if (!this.measurement || !this.measurement.id) return;

    const measurementSetting:MeasurementSetting|null = this.measurement.messeinstellung;
    const hasFull = !!(measurementSetting && measurementSetting.coil && measurementSetting.coil.coiltype);
    if (hasFull) return;

    try {
      // If messeinstellung is missing but we have an ID, load the full setting which also includes coil/coiltye
      if (!measurementSetting && this.measurement.messeinstellungId) {
        const setting = await this.measurementSettingsService.reloadElementWithId(this.measurement.messeinstellungId);
        this.measurement.messeinstellung = setting;
        return;
      }

      // If messeinstellung exists but coil/coiItype are missing, try reloading the messeinstellung
      if (measurementSetting && (!measurementSetting.coil || !measurementSetting.coil.coiltype) && measurementSetting.id) {
        const setting = await this.measurementSettingsService.reloadElementWithId(measurementSetting.id);
        this.measurement.messeinstellung = setting;
        return;
      }

      // Fallback: reload the entire measurement if above didn't provide the nested data
      const full = await this.messungService.reloadElementWithId(this.measurement.id);
      this.measurement = full;
    } catch (err) {
      console.error('Error loading full measurement details for id', this.measurement.id, err);
    }
  }

  private async loadMesswerte(): Promise<void> {
    if (!this.measurement || !this.measurement.id) {
      this.messwerte.set([]);
      return;
    }
    
    const messwerte: Messwert[] = await this.messwertService.getMesswerteByMessungId(this.measurement.id);
    this.messwerte.set(messwerte);

    // initialize slider bounds and compute initial derived values
    this.initializeSliderBounds();
  }

  private initializeSliderBounds(): void {
    // prefer explicit measurement timestamps, fallback to messwerte min/max
    const start = asDate(this.measurement?.anfangszeitpunkt) ?? null;
    const end = asDate(this.measurement?.endzeitpunkt) ?? null;

    const mw = this.messwerte();
    let minFromData: Date | null = null;
    let maxFromData: Date | null = null;
    for (const m of mw) {
      const z = asDate(m.zeitpunkt);
      if (!z) continue;
      if (!minFromData || z.getTime() < minFromData.getTime()) minFromData = z;
      if (!maxFromData || z.getTime() > maxFromData.getTime()) maxFromData = z;
    }

    const finalStart = start ?? minFromData ?? new Date();
    const finalEnd = end ?? maxFromData ?? finalStart;

    this.sliderMinMs = finalStart.getTime();
    this.sliderMaxMs = finalEnd.getTime();

    // default slider to end (latest time)
    this.sliderValue.set(this.sliderMaxMs);
    this.selectedTime.set(new Date(this.sliderValue()));

    // compute derived values for initial time
    this.updateDerivedAt(new Date(this.sliderValue()));
  }

  public onSliderInput(ev: Event | any): void {
    const raw:any = ev?.target?.value ?? ev;
    const ms:number = Number(raw);
    if (isNaN(ms)) return;
    this.sliderValue.set(ms);
    const date: Date = new Date(ms);
    this.selectedTime.set(date);
    this.updateDerivedAt(date);
  }

  public selectedRelativeSeconds(): string {
    const sel = this.selectedTime();
    if (!sel) return '';
    const relMs = sel.getTime() - this.sliderMinMs;
    const sign = relMs < 0 ? '-' : '';
    const abs = Math.abs(relMs);
    return `${sign}${(abs / 1000).toFixed(3)}s`;
  }

  /**
   * Build yokes structure from available messwerte using the most recent value
   * at or before the given time for each sensor, then call the displacement
   * calculation service to compute yokeData and total mass.
   */
  private updateDerivedAt(time: Date): void {
    const measurement = this.measurement;
    if (!measurement || !measurement.messeinstellung) {
      this.yokes.set([]);
      this.yokeData.set([]);
      this.m_tot.set(0);
      return;
    }

    const messwerte = this.messwerte();

    // determine yoke count
    const coiltype = measurement.messeinstellung.coil?.coiltype;
    const yokeCount = coiltype?.schenkel ?? 0;

    // number of sensors per yoke (prefer messeinstellung value)
    let sensorsPerYoke = measurement.messeinstellung.sondenProSchenkel ?? 0;
    if (!sensorsPerYoke || sensorsPerYoke < 1) {
      // fallback: determine from data by finding max position number (positions are 1-based in backend)
      let maxPos = 0;
      for (const m of messwerte) {
        const pos = m.sondenPosition?.position ?? null;
        if (pos !== null && pos !== undefined && typeof pos === 'number') {
          if (pos > maxPos) maxPos = pos;
        }
      }
      // If backend uses 1-based positions, maxPos is already the count; fallback to 1 if nothing found
      sensorsPerYoke = maxPos > 0 ? maxPos : 1;
    }

    // Build yokes array
    const yokesArr: { sensors: number[] }[] = [];
    for (let y = 0; y < yokeCount; y++) {
      const sensors: number[] = new Array(sensorsPerYoke).fill(0);
      for (let s = 0; s < sensorsPerYoke; s++) {
        // find the most recent messwert for this yoke/position at or before time
        let candidate: Messwert | null = null;
        let candidateTime = 0;
        for (const mw of messwerte) {
          const wp = mw.sondenPosition;
          if (!wp) continue;
          const schenkel = wp.schenkel ?? null;
          const pos = wp.position ?? null;
          if (schenkel === null || pos === null) continue;
          // Backend stores schenkel and position as 1-based numbers; convert to 0-based indexes for comparison
          const schenkelIndex = (typeof schenkel === 'number') ? (schenkel - 1) : schenkel;
          const posIndex = (typeof pos === 'number') ? (pos - 1) : pos;
          if (schenkelIndex !== y) continue;
          if (posIndex !== s) continue;
          const z = asDate(mw.zeitpunkt);
          if (!z) continue;
          const tz = z.getTime();
          if (tz <= time.getTime() && tz >= candidateTime) {
            candidate = mw;
            candidateTime = tz;
          }
        }
        sensors[s] = candidate?.wert ?? 0;
      }
      yokesArr.push({ sensors });
    }

    this.yokes.set(yokesArr);

    // call displacement calculation with the current measurement settings
    try {
      const probeType = measurement.messeinstellung.probeType!;
      const coil = measurement.messeinstellung.coil!;
      const coiltypeObj = coil.coiltype!;
      const measurementSetting = measurement.messeinstellung!;
      const calc = this.displacementCalculation.calculateYokeData(yokesArr, probeType, [], coiltypeObj, coil, measurementSetting, measurement.pruefspannung!);
      this.yokeData.set(calc.F);
      this.m_tot.set(calc.m_tot);
    } catch (err) {
      console.error('Error calculating displacement for selected time', err);
      this.yokeData.set([]);
      this.m_tot.set(0);
    }
  }

  public navigateBack(): void {
    this.router.navigate(['/measurement-management']);
  }

  public openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  public async confirmDeleteCurrentMessung(): Promise<void> {
    if (!this.measurement || !this.measurement.id) {
      return;
    }

    try {
      await this.messungService.deleteElement(this.measurement.id);
      this.router.navigate(['/measurement-management']);
    } catch (error) {
      console.error('Fehler beim Löschen der Messung:', error);
    } finally {
      this.showDeleteModal = false;
    }
  }
}
