import { Component, signal } from '@angular/core';
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
  imports: [FormsModule, MeasurementProbeManagementComponent, CommonModule],
  templateUrl: './measurement-settings.component.html',
  styleUrl: './measurement-settings.component.scss'
})
export class MeasurementSettingsComponent {
  schenkelAnzahl = signal<number[]>([1, 2, 3, 4, 5])
  saveMessage: string | null = null
  selectedCoil: Coil | null = null;
  originalMeasurementSetting: MeasurementSetting | null = null;

  public get selectedMeasurementSetting(): MeasurementSetting | null {
    //console.log(this.coilsService.selectedCoilCopy);
    //this.coiltypesService.coiltypes.find(c => c.tK_Name === this.selectedCoilTypeName)!
    return this.measurementSettingsService.selectedElementCopy;
  }

  measurementSettings: MeasurementSetting = {
    id: null,
    coil: null,
    coilId: null,
    measurementProbeType: null,
    measurementProbeTypeId: null,
    wicklungszahl: null,
    bemessungsspannung: null,
    bemessungsfrequenz: null,
    sondenProSchenkel: null,
    notiz: null
  };


  ngOnInit() {
    if (this.selectedCoil) {
      this.originalMeasurementSetting = {...this.selectedMeasurementSetting!};
    }
  }

  constructor(public measurementSettingsService: MeasurementSettingsService, public coilsSerivce: CoilsService ,private router: Router){}

  async saveChanges() {
    if (!this.selectedCoil) return;

    //this.saveError = true; // Fehlerprüfung aktivieren

    //const requiredFields = ['ur', 'einheit', 'auftragsnummer', 'auftragsPosNr', 'omega'];
    //const invalidFields = requiredFields.filter(field => this.isFieldInvalid(field));

    /*if (invalidFields.length > 0) {
      this.saveMessage = "Bitte füllen Sie alle Pflichtfelder aus.";
      return;
    }*/

    try {
      await this.measurementSettingsService.updateOrCreateElement(this.selectedMeasurementSetting!);
      //this.onCoilSelectionChange(this.selectedCoilId!);

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

  openCoilSelect()
  {
    this.coilsSerivce.selectedElementCopy = null;
    this.coilsSerivce.isCoilSelector = true;

    this.router.navigate(['/coil-management']);
  }
}
