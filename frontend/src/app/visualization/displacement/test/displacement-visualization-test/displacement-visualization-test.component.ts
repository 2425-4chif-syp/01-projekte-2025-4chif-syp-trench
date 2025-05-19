import { Component, signal } from '@angular/core';
import { DisplacementVisualizationComponent } from '../../components/displacement-visualization.component';

@Component({
  selector: 'app-displacement-visualization-test',
  standalone: true,
  imports: [DisplacementVisualizationComponent],
  templateUrl: './displacement-visualization-test.component.html',
  styleUrl: './displacement-visualization-test.component.scss'
})
export class DisplacementVisualizationTestComponent {
  yokes = signal<{sensors:number[]}[]>([
    { sensors: [1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7] },
    { sensors: [1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051.0] },
    { sensors: [1161.2, 1423.0, 1744.1, 1807.6, 1472.1, 1139.1] }]);
}
