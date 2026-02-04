import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MessungService } from '../services/messung.service';
import { MesswertBackendService } from '../../messwert/services/messwert-backend.service';
import { Messwert } from '../../messwert/interfaces/messwert.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmDeleteModalComponent } from '../../../shared/confirm-delete-modal/confirm-delete-modal.component';
import { MessungDetailAuswertungComponent } from './auswertung/messung-detail-auswertung/messung-detail-auswertung.component';
import { TimelineGraphComponent } from './timeline-graph/timeline-graph.component';
import { Measurement } from '../../measurement-history/interfaces/measurement.model';
import { DisplacementCalculationService } from '../../../calculation/displacement/displacement-calculation.service';
import { MeasurementSettingsService } from '../../measurement-settings/services/measurement-settings.service';
import { MeasurementSetting } from '../../measurement-settings/interfaces/measurement-settings';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule, ConfirmDeleteModalComponent, MessungDetailAuswertungComponent, TimelineGraphComponent],
  templateUrl: './messung-detail.component.html',
  styleUrls: ['./messung-detail.component.scss']
})
export class MessungDetailComponent {
  constructor(
    public messungService: MessungService,
    public messwertService: MesswertBackendService,
    private router: Router,
    private route: ActivatedRoute,
    private displacementCalculation: DisplacementCalculationService,
    private measurementSettingsService: MeasurementSettingsService,
    private sanitizer: DomSanitizer) {}

  public readonly environment = environment;

  measurement: Measurement | null = null;
  messwerte = signal<Messwert[]>([]);
  showDeleteModal: boolean = false;
  public grafanaPanelUrls = new Map<number, SafeResourceUrl>();

  // Loading state
  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('Lade Messdaten...');
  loadingProgress = signal<number>(0);
  messwertCount = signal<number>(0);

  yokes = signal<{ sensors: number[] }[]>([]);;
  yokeData = signal<{ x: number; y: number }[][]>([]);
  m_tot = signal<number>(0);
  // Series of [timeMs, m_tot] to feed timeline component
  mTotSeries: number[][] = [];

  // Slider state: milliseconds since epoch
  sliderMinMs: number = 0;
  sliderMaxMs: number = 0;
  sliderValue = signal<number>(0);

  // selected time as Date (signal for template access if needed)
  selectedTime = signal<Date | null>(null);

  async ngOnInit(): Promise<void> {
    // Try to get measurement from route parameter first (allows page reload)
    const idParam: string | null = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const messungId: number = Number(idParam);
      if (!isNaN(messungId) && messungId > 0) {
        try {
          this.measurement = await this.messungService.reloadElementWithId(messungId);
          this.messungService.clickedMessung = this.measurement;
        } catch (err) {
          console.error('Error loading measurement from route:', err);
          this.router.navigate(['/measurement-management']);
          return;
        }
      }
    } else {
      // Fallback to clicked measurement from service (old behavior)
      this.measurement = this.messungService.clickedMessung;
    }

    if (!this.measurement || !this.measurement.id) {
      console.error('No measurement found');
      this.router.navigate(['/measurement-management']);
      return;
    }

    await this.ensureMeasurementDetails();
    await this.loadMesswerte();
    this.buildGrafanaPanelUrls();
  }

  public schenkelNumbers(): number[] {
    const count = this.measurement?.messeinstellung?.coil?.coiltype?.schenkel ?? 0;
    if (!count || count < 1) return [];
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  public grafanaSchenkelPanelUrl(schenkel: number): SafeResourceUrl | null {
    const cached = this.grafanaPanelUrls.get(schenkel);
    if (cached) return cached;

    const base = (environment.grafanaBaseUrl ?? '').trim().replace(/\/+$/, '');
    if (!base) return null;
    const uid = environment.grafanaDashboardUid;
    const slug = environment.grafanaDashboardSlug;
    const orgId = environment.grafanaOrgId;
    const panelId = environment.grafanaSchenkelPanelId;
    const messungId = this.measurement?.id;
    if (!uid || !slug || !panelId) return null;

    const url = new URL(`${base}/d-solo/${encodeURIComponent(uid)}/${encodeURIComponent(slug)}`);
    url.searchParams.set('orgId', String(orgId ?? 1));
    url.searchParams.set('panelId', String(panelId));

    const start = asDate(this.measurement?.anfangszeitpunkt);
    const end = asDate(this.measurement?.endzeitpunkt);
    const fromMs = start?.getTime() ?? Date.now() - 30 * 24 * 60 * 60 * 1000;
    const endMs = (end && end.getTime() > 0) ? end.getTime() : Date.now();
    url.searchParams.set('from', String(fromMs));
    url.searchParams.set('to', String(endMs));
    url.searchParams.set('theme', 'light');
    url.searchParams.set('var-schenkel', String(schenkel));
    if (messungId) url.searchParams.set('var-messungId', String(messungId));

    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    this.grafanaPanelUrls.set(schenkel, safe);
    return safe;
  }

  private buildGrafanaPanelUrls(): void {
    this.grafanaPanelUrls.clear();
    for (const s of this.schenkelNumbers()) {
      const url = this.grafanaSchenkelPanelUrl(s);
      if (url) this.grafanaPanelUrls.set(s, url);
    }
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
      this.isLoading.set(false);
      return;
    }

    try {
      this.isLoading.set(true);
      this.loadingProgress.set(0);
      this.loadingMessage.set('Lade Messdaten vom Server...');
      await this.delay(50);
      
      this.loadingProgress.set(10);
      await this.delay(100);

      const messwerte: Messwert[] = await this.messwertService.getMesswerteByMessungId(this.measurement.id);
      this.messwerte.set(messwerte);
      this.messwertCount.set(messwerte.length);
      this.loadingProgress.set(50);
      await this.delay(100);

      this.loadingMessage.set('Initialisiere Zeitachse...');
      this.loadingProgress.set(60);
      await this.delay(100);

      // initialize slider bounds and compute initial derived values
      this.initializeSliderBounds();
      this.loadingProgress.set(70);
      await this.delay(100);

      this.loadingMessage.set('Berechne Auswertung...');
      this.loadingProgress.set(80);
      await this.delay(100);

      // Build m_tot series based on available timestamps
      this.buildMTotSeries();
      this.loadingProgress.set(90);
      await this.delay(100);

      this.loadingMessage.set('Fertig!');
      this.loadingProgress.set(100);
      await this.delay(200);
    } catch (err) {
      console.error('Error loading messwerte:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  private computeMTotAt(time: Date): number {
    const measurement = this.measurement;
    if (!measurement || !measurement.messeinstellung) {
      return 0;
    }

    const messwerte = this.messwerte();

    const coiltype = measurement.messeinstellung.coil?.coiltype;
    const yokeCount = coiltype?.schenkel ?? 0;

    let sensorsPerYoke = measurement.messeinstellung.sondenProSchenkel ?? 0;
    if (!sensorsPerYoke || sensorsPerYoke < 1) {
      let maxPos = 0;
      for (const m of messwerte) {
        const pos = m.sondenPosition?.position ?? null;
        if (pos !== null && pos !== undefined && typeof pos === 'number') {
          if (pos > maxPos) maxPos = pos;
        }
      }
      sensorsPerYoke = maxPos > 0 ? maxPos : 1;
    }

    const yokesArr: { sensors: number[] }[] = [];
    for (let y = 0; y < yokeCount; y++) {
      const sensors: number[] = new Array(sensorsPerYoke).fill(0);
      for (let s = 0; s < sensorsPerYoke; s++) {
        let candidate: Messwert | null = null;
        let candidateTime = 0;
        for (const mw of messwerte) {
          const wp = mw.sondenPosition;
          if (!wp) continue;
          const schenkel = wp.schenkel ?? null;
          const pos = wp.position ?? null;
          if (schenkel === null || pos === null) continue;
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

    try {
      const probeType = measurement.messeinstellung.probeType!;
      const coil = measurement.messeinstellung.coil!;
      const coiltypeObj = coil.coiltype!;
      const measurementSetting = measurement.messeinstellung!;
      const calc = this.displacementCalculation.calculateYokeData(yokesArr, probeType, [], coiltypeObj, coil, measurementSetting, measurement.pruefspannung!);
      return calc.m_tot ?? 0;
    } catch (err) {
      console.error('Error calculating m_tot for time', time, err);
      return 0;
    }
  }

  private buildMTotSeries(): void {
    const mw = this.messwerte();
    if (!mw || mw.length === 0) {
      this.mTotSeries = [];
      return;
    }
    // Collect unique timestamps (ms) from messwerte
    const timesSet = new Set<number>();
    for (const m of mw) {
      const z = asDate(m.zeitpunkt);
      if (!z) continue;
      timesSet.add(z.getTime());
    }
    const times = Array.from(timesSet.values()).sort((a, b) => a - b);
    const series: number[][] = [];
    for (const t of times) {
      const val = this.computeMTotAt(new Date(t));
      series.push([t, val]);
    }
    this.mTotSeries = series;
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
