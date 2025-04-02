import { Component, signal, OnInit  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeasurementProbeManagementComponent } from '../../../measurement-probe/components/measurement-probe-management.component';
import { MeasurementSetting } from '../../interfaces/measurement-settings';
import { Coil } from '../../../coil/interfaces/coil';
import { MeasurementSettingsService } from '../../services/measurement-settings.service';
import { Router } from '@angular/router';
import { CoilsService } from '../../../coil/services/coils.service';


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
    //this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)!
    return this.measurementSettingsService.selectedElementCopy;
  }

  public get selectedSettingId(): number | undefined {
    return this.measurementSettingsService.selectedElementCopy?.id!;
  }
  public set selectedSettingId(id: number) {
    this.measurementSettingsService.selectElement(Number(id));
  }

  measurementSettings: MeasurementSetting = {
    id: null,
    coil: null,
    coilId: null,
    measurementProbeType: null,
    measurementProbeTypeId: null,
    pruefspannung: null,
    //wicklungszahl: null,
    bemessungsspannung: null,
    bemessungsfrequenz: null,
    sondenProSchenkel: null,
    notiz: null
  };


  ngOnInit() {
    if (this.originalMeasurementSetting) {
      this.originalMeasurementSetting = {...this.selectedMeasurementSetting!};
    }

    console.log("TestInit")
  }

  constructor(public measurementSettingsService: MeasurementSettingsService, public coilsSerivce: CoilsService ,private router: Router){}

  async saveChanges() {
    if (this.originalMeasurementSetting) return;

    //this.saveError = true; // Fehlerprüfung aktivieren

    //const requiredFields = ['ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    //const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    /*if (invalidFields.length > 0) {
      this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
      return;
    }*/

    try {
      let tmpSetting: MeasurementSetting = {
        id: 1,
        coil: this.selectedMeasurementSetting?.coil!,
        coilId: this.selectedMeasurementSetting?.coilId!,
        measurementProbeType: {
          id: 5,
          breite: 250,
          hoehe: 150,
          wicklungszahl: 15,
          notiz: "",
        },
        measurementProbeTypeId: 5,
        pruefspannung: this.measurementSettings.pruefspannung,
        //wicklungszahl: 15,
        bemessungsspannung: this.measurementSettings.bemessungsspannung,
        bemessungsfrequenz: this.measurementSettings.bemessungsfrequenz,
        sondenProSchenkel: Number(this.measurementSettings.sondenProSchenkel),
        notiz: ""
      };

      console.log(tmpSetting!);
      await this.measurementSettingsService.updateOrCreateElement(tmpSetting!);
      this.onSettingSelectionChange(this.selectedSettingId!);

      this.saveMessage = "Änderungen gespeichert!";
      setTimeout(() => {
        this.saveMessage = null;
      }, 3000);

      //this.saveError = false;

      this.originalMeasurementSetting = {...tmpSetting!};
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
    this.coilsSerivce.selectedElementCopy = null;
    this.coilsSerivce.isCoilSelector = true;

    this.router.navigate(['/coil-management']);
  }

  backToListing(){
    this.measurementSettingsService.selectedElementCopy = null;
  }
}
