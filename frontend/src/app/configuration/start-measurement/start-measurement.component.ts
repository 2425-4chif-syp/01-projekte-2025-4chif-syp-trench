import { Component, LOCALE_ID, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from './services/websocket.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { DisplacementVisualizationComponent } from "../../visualization/displacement/components/displacement-visualization.component";
import { FormsModule } from '@angular/forms';
import { MeasurementSetting } from '../measurement-settings/interfaces/measurement-settings';
import { MeasurementSettingsService } from '../measurement-settings/services/measurement-settings.service';
import { MeasurementSettingsBackendService } from '../measurement-settings/services/measurement-settings-backend.service';
import { CoilsBackendService } from '../coil/services/coils-backend.service';
import { CoiltypesBackendService } from '../coiltype/services/coiltypes-backend.service';
import { ProbeTypesBackendService } from '../probe-type/services/probe-types-backend.service';
import { MeasurementsBackendService } from '../measurement-history/services/measurement-backend.service';
import { DisplacementCalculationService } from '../../calculation/displacement/displacement-calculation.service';

registerLocaleData(localeDe);

@Component({
  selector: 'app-start-measurement',
  standalone: true,
  imports: [CommonModule, DisplacementVisualizationComponent, FormsModule], 
  providers: [WebSocketService, { provide: LOCALE_ID, useValue: 'de' }],
  templateUrl: './start-measurement.component.html',
  styleUrl: './start-measurement.component.scss'
})
export class StartMeasurementComponent implements OnDestroy {
  yokes = signal<{ sensors: number[] }[]>([]);
  yokeData = signal<{ x: number; y: number }[][]>([]);
  m_tot: number = 0;
  sensorValues: { [key: string]: number } = {}; 

  isConnected: boolean = false;
  measurementSettingId: number | null = null;
  note: string = '';
  showIdError: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;
  currentMeasurement: boolean = false;
  
  private startTime: Date | null = null;
  private measurementData: { [key: string]: number[] } = {};
  private isSaving: boolean = false;

  constructor(
    private webSocketService: WebSocketService,
    private displacementCalculationService: DisplacementCalculationService,
    public measurementSettingsService: MeasurementSettingsService,
    private measurementsBackendService: MeasurementsBackendService,
    private coiltypesBackendService: CoiltypesBackendService,
    private coilsBackendService: CoilsBackendService,
    private probeTypesBackendService: ProbeTypesBackendService
  ) {
    this.loadMeasurementSettings();
  }
  
  public get selectedMeasurementSetting(): MeasurementSetting | null {
    return this.measurementSettingsService.elements.find(setting => setting.id == this.measurementSettingId) ?? null;
  }

  public get isWithinTolerance(): boolean {
    return this.m_tot < this.selectedMeasurementSetting!.coil!.coiltype!.toleranzbereich!;
  }

  async loadMeasurementSettings(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    await this.measurementSettingsService.reloadElements();
    this.isLoading = false;
  }

  isValid(): boolean {
    return this.measurementSettingId !== null && this.measurementSettingId > 0;
  }

  async startMeasurement(): Promise<void> {
    if (!this.isValid()) {
      this.showIdError = true;
      this.error = 'Bitte wählen Sie eine gültige Messeinstellung aus';
      return;
    }

    try {
      // Hole die Messeinstellung direkt vom Backend
      const measurementSetting = await this.measurementSettingsService.reloadElementWithId(this.measurementSettingId!);
      if (!measurementSetting) {
        this.showIdError = true;
        this.error = 'Die ausgewählte Messeinstellung konnte nicht gefunden werden';
        throw new Error('Keine Messeinstellung ausgewählt');
      }

      // Starte die Messung im Backend
      await this.measurementsBackendService.startMeasuring();
      this.currentMeasurement = true;

      // Lade zuerst die Coil-Informationen
      let coil = measurementSetting.coil;
      if (!coil && measurementSetting.coilId) {
        coil = await this.coilsBackendService.getCoil(measurementSetting.coilId);
        if (!coil) {
          throw new Error('Coil konnte nicht geladen werden');
        }
        measurementSetting.coil = coil;
      }

      if (!coil) {
        throw new Error('Keine Coil-Informationen verfügbar');
      }

      // Dann lade die Coiltype-Informationen
      let coiltype = coil.coiltype;
      if (!coiltype && coil.coiltypeId) {
        console.log('Lade Coiltype mit ID:', coil.coiltypeId);
        coiltype = await this.coiltypesBackendService.getCoiltype(coil.coiltypeId);
        if (!coiltype) {
          throw new Error('Coiltype konnte nicht geladen werden');
        }
        coil.coiltype = coiltype;
      }

      if (!coiltype) {
        throw new Error('Keine Coiltype-Informationen verfügbar');
      }

      // Überprüfe die Schenkelzahl
      if (!coiltype.schenkel) {
        throw new Error('Keine Schenkel-Informationen im Coiltype verfügbar');
      }

      let probeType = this.selectedMeasurementSetting!.probeType;
      if (probeType === null) {
        probeType = await this.probeTypesBackendService.getProbeType(this.selectedMeasurementSetting?.probeTypeId!);
      }
      this.selectedMeasurementSetting!.probeType = probeType;


      const yokeCount = coiltype.schenkel;
      const sensorCount = measurementSetting.sondenProSchenkel || 0;
      
      if (sensorCount <= 0) {
        throw new Error('Ungültige Anzahl von Sonden pro Schenkel');
      }

      console.log(`Initialisiere ${yokeCount} Schenkel mit je ${sensorCount} Sensoren`);

      // Initialisiere die Yokes und Sensoren
      this.yokes.set(Array.from({ length: yokeCount }, () => ({ sensors: Array(sensorCount).fill(0) })));
      
      this.startTime = new Date();
      this.measurementData = {};
      for (let i = 0; i < yokeCount; i++) {
        for (let j = 0; j < sensorCount; j++) {
          const key = `S${i+1}S${j+1}`;
          this.measurementData[key] = [];
        }
      }
      
      // Verbinde mit WebSocket
      await this.webSocketService.connect();
      this.isConnected = true;
      this.showIdError = false;

      // Sende Konfiguration
      const config = {
        type: 'config',
        measurementSettingId: this.measurementSettingId,
        note: this.note
      };
      console.log('Sende Konfiguration:', config);
      this.webSocketService.sendMessage(JSON.stringify(config));

      this.webSocketService.getMessages().subscribe({
        next: (message: string) => {
          const [topic, value] = message.split(':'); 
          const yokeIndex: number = parseInt(topic.split('S')[1]) - 1;
          const sensorIndex: number = parseInt(topic.split('S')[2]) - 1;
          const sensorValue: number = parseFloat(value);

          if (yokeIndex >= yokeCount || sensorIndex >= sensorCount) {
            console.log(`Skipped message: Yoke ${yokeIndex+1}, Sensor ${sensorIndex+1}, Value ${sensorValue}`);
            return;
          }
    
          this.yokes.update((prevYokes) => {
            const updatedYokes = [...prevYokes];
            updatedYokes[yokeIndex].sensors[sensorIndex] = sensorValue;
            return updatedYokes;
          });

          const result = this.displacementCalculationService.calculateYokeData(
            this.yokes(),
            probeType!,
            [],
            coiltype!,
            coil!,
            measurementSetting!
          );

          this.yokeData.set(result.F);
          this.m_tot = result.m_tot;

          const key = `S${yokeIndex+1}S${sensorIndex+1}`;
          if (this.measurementData[key]) {
            this.measurementData[key].push(sensorValue);
          }
        },
        error: (err: any) => {
          console.error('Fehler beim Laden der Messeinstellungen:', err);
          this.error = 'Fehler beim Laden der Messeinstellungen';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Fehler beim Verbinden:', error);
      this.isConnected = false;
      this.showIdError = true;
    }
  }

  async stopMeasurement(): Promise<void> {
    if (this.isConnected && !this.isSaving) {
      this.isSaving = true;
      this.webSocketService.disconnect();
      this.isConnected = false;
      
      try {
        // Stoppe die Messung im Backend
        await this.measurementsBackendService.stopMeasuring();
        this.currentMeasurement = false;

        if (this.startTime && this.measurementSettingId) {
          const endTime = new Date();
          
          const measurementData = {
            id: null,
            messeinstellungID: this.measurementSettingId,
            anfangszeitpunkt: this.startTime.toISOString(),
            endzeitpunkt: endTime.toISOString(),
            name: "",
            tauchkernstellung: 0,
            pruefspannung: 0,
            notiz: this.note || "",
            messsonden: this.createMesssondenData().map(sonde => ({
              schenkel: sonde.schenkel,
              position: sonde.position,
              messwerte: sonde.messwerte,
              durchschnittswert: sonde.durchschnittswert
            }))
          };
          
          console.log('Speichere Messung:', measurementData);
          await this.measurementsBackendService.saveMeasurement(measurementData);
          console.log('Messung erfolgreich gespeichert');
        }
      } catch (error) {
        console.error('Fehler beim Speichern der Messung:', error);
        this.error = 'Fehler beim Speichern der Messung';
      } finally {
        this.isSaving = false;
        this.yokes.set([]); 
      }
    } else {
      this.yokes.set([]); 
    }
  }
  
  private createMesssondenData(): any[] {
    const messsonden: any[] = [];
    
    for (let yokeIndex = 0; yokeIndex < this.yokes().length; yokeIndex++) {
      for (let sensorIndex = 0; sensorIndex < this.yokes()[yokeIndex].sensors.length; sensorIndex++) {
        const key = `S${yokeIndex+1}S${sensorIndex+1}`;
        const values = this.measurementData[key] || [];
        
        const avgValue = values.length > 0 
          ? values.reduce((sum, val) => sum + val, 0) / values.length 
          : 0;
        
        messsonden.push({
          schenkel: yokeIndex + 1,
          position: sensorIndex + 1,
          messwerte: values,
          durchschnittswert: avgValue
        });
      }
    }
    
    return messsonden;
  }

  ngOnDestroy(): void {
    this.stopMeasurement();
  }
}