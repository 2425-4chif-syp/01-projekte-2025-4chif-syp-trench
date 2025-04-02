import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GenericListComponent } from '../../../../generic-list/generic-list.component';
import { LIST_SERVICE_TOKEN } from '../../../list-service';
import { MeasurementSettingsService } from '../../../measurement-data/measurement-settings/measurement-settings.service';
import { MeasurementSetting } from '../../../measurement-data/measurement-settings/measurement-settings';

@Component({
  selector: 'app-measurement-settings-list',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  providers: [
    {
      provide: LIST_SERVICE_TOKEN,
      useExisting: MeasurementSettingsService
    }
  ],
  templateUrl: './measurement-settings-list.component.html',
  styleUrl: './measurement-settings-list.component.scss'
})
export class MeasurementSettingsListComponent {

  public constructor(private measurementSettingsService: MeasurementSettingsService){}

  public readonly keysAsColumns: { [key: string]: string } = {
    'coilId': 'Spule',
    'measurementProbeTypeId': 'Sondentyp',
    'wicklungszahl': 'Wicklungen',
    'bemessungsspannung': 'Spannung',
    'bemessungsfrequenz': 'Frequenz',
    'sondenProSchenkel': 'Sonden/Schenkel',
    'notiz': 'Notiz'
  }
  
  public readonly elementValueToStringMethods: { [key: string]: (element:MeasurementSetting) => string } = {
    'coilId': (element) => element.coil?.coiltype?.name ?? `Spule ${element.coilId}`,
    //'measurementProbeTypeId': (element) => element.measurementProbeType?.probeTypeID ?? `Sonde ${element.measurementProbeTypeId}`
  }
  

  test(){

  }

  openSetting(setting: MeasurementSetting) {
    this.measurementSettingsService.selectElement(setting.coilId!);
  }
  
}
