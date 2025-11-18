import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LIST_SERVICE_TOKEN } from '../../../../generic-list/services/list-service';
import { MeasurementSettingsService } from '../../services/measurement-settings.service';
import { GenericListComponent } from '../../../../generic-list/components/generic-list.component';
import { MeasurementSetting } from '../../interfaces/measurement-settings';
import {Coil} from "../../../coil/interfaces/coil";

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

  @Input() public isSelector: boolean = false;
  @Input() public showButton: boolean = true;

  @Output() selectSetting = new EventEmitter<MeasurementSetting>();
   @Output() cancelSelection = new EventEmitter<void>();

  public constructor(private measurementSettingsService: MeasurementSettingsService){}

  public readonly keysAsColumns: { [key: string]: string } = {
    'coilId': 'Spule',
    'sondentyp_id': 'Sondentyp',
    'name': 'Name',
    'sondenProSchenkel': 'Sonden/Schenkel'
  }

  public readonly elementValueToStringMethods: { [key: string]: (element:MeasurementSetting) => string } = {
    'coilId': (element) => element.coil?.coiltype?.name ?? `${element.coilId}`
    //'measurementProbeTypeId': (element) => element.measurementProbeType?.probeTypeID ?? `Sonde ${element.measurementProbeTypeId}`
  }

  openSetting(setting: MeasurementSetting) {
    if (this.isSelector) {
      this.selectSetting.emit(setting);
      return;
    }

    const settingId = setting.id!;
    this.measurementSettingsService.selectElement(settingId);
  }

  onCancelSelection(): void {
    this.cancelSelection.emit();
  }
}
