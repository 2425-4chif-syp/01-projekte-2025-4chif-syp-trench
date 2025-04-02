import { Component, signal, OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeasurementProbeManagementComponent } from '../../../measurement-probe/components/measurement-probe-management.component';
import { MeasurementSetting } from '../../interfaces/measurement-settings';
import { Coil } from '../../../coil/interfaces/coil';
import { MeasurementSettingsService } from '../../services/measurement-settings.service';
import { Router } from '@angular/router';
import { CoilsService } from '../../../coil/services/coils.service';
import {MeasurementProbeTypesService} from "../../../measurement-probe-type/services/measurement-probe-types.service";


@Component({
  selector: 'app-measurement-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent implements OnInit {
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5])
  saveMessage: string | null = null
  originalMeasurementSetting: MeasurementSetting | null = null;

  public get selectedMeasurementSetting(): MeasurementSetting | null {
    //console.log(this.coilsService.selectedCoilCopy);
    return this.measurementSettingsService.selectedElementCopy;
  }

  public set selectedMeasurementSetting(value: MeasurementSetting) {
    this.selectedMeasurementSetting = value;
  }

  public get selectedSettingId(): number | undefined {
    return this.measurementSettingsService.selectedElementCopy?.id!;
  }
  public set selectedSettingId(id: number) {
    this.measurementSettingsService.selectElement(Number(id));
  }

  ngOnInit() {
    if (!this.originalMeasurementSetting) {
      this.originalMeasurementSetting = {...this.selectedMeasurementSetting!};
    }

    console.log(this.measurementSettingsService.selectedElementCopy);
  }

  constructor(public measurementSettingsService: MeasurementSettingsService, public coilsService: CoilsService, public probeService: MeasurementProbeTypesService , private router: Router){
    this.coilsService.isCoilSelector = false;
    this.probeService.isProbeSelector = false;
  }

  async saveChanges() {
    if (!this.originalMeasurementSetting) return;

    //this.saveError = true; // Fehlerprüfung aktivieren

    //const requiredFields = ['ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    //const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    /*if (invalidFields.length > 0) {
      this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
      return;
    }*/

    try {
      this.selectedMeasurementSetting!.id = this.measurementSettingsService.selectedElementCopy?.id! || 0;
      this.selectedMeasurementSetting!.notiz = "";
      console.log(this.selectedMeasurementSetting!);
      await this.measurementSettingsService.updateOrCreateElement(this.selectedMeasurementSetting!);
      this.onSettingSelectionChange(this.selectedSettingId!);

      this.saveMessage = "Änderungen gespeichert!";
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);

      //this.saveError = false;

      this.originalMeasurementSetting = {...this.selectedMeasurementSetting!};
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      this.saveMessage = "Fehler beim Speichern!";
    }
  }

  async onSettingSelectionChange(SettingId: number) {
    const settingIdNumber: number = Number(SettingId);

    await this.measurementSettingsService.selectElement(settingIdNumber);
  }

  openCoilSelect()
  {
    this.coilsService.selectedElementCopy = null;
    this.coilsService.isCoilSelector = true;

    this.router.navigate(['/coil-management']);
  }

  openProbeSelect()
  {
    this.probeService.selectedElementCopy = null;
    this.probeService.isProbeSelector = true;

    this.router.navigate(['/measurement-probe-type-management']);
  }

  backToListing(){
    this.measurementSettingsService.selectedElementCopy = null;
  }
}
