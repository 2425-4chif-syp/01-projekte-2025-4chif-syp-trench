import { Component } from '@angular/core';
import {MeasurementSettingsService} from "../services/measurement-settings.service";
import {MeasurementSettingsListComponent} from "./list/measurement-settings-list.component";
import {CommonModule} from "@angular/common";
import {MeasurementSettingsComponent} from "./management/measurement-settings.component";

@Component({
  selector: 'app-measurement-settings-parent',
  standalone: true,
  imports: [CommonModule, MeasurementSettingsListComponent, MeasurementSettingsComponent],
  templateUrl: './measurement-settings-parent.component.html',
  styleUrl: './measurement-settings-parent.component.scss'
})
export class MeasurementSettingsParentComponent {

  constructor(public measurementSettingsService: MeasurementSettingsService) {
  }
}
