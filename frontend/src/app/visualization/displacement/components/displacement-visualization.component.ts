import { Component, effect, HostListener, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule, DecimalPipe} from "@angular/common";
import { CoilVisualizationComponent } from "../../coil/components/coil-visualization.component";
import { DisplacementCalculationService } from '../../../calculation/displacement/displacement-calculation.service';
import { Coil } from '../../../configuration/coil/interfaces/coil';
import { Coiltype } from '../../../configuration/coiltype/interfaces/coiltype';
import { MeasurementSetting } from '../../../configuration/measurement-settings/interfaces/measurement-settings';
import { ProbeType } from '../../../configuration/probe-type/interfaces/probe-type';
import { Probe } from '../../../configuration/probe/interfaces/probe';

@Component({
  selector: 'app-displacement-visualization',
  standalone: true,
  imports: [FormsModule, DecimalPipe, CommonModule, CoilVisualizationComponent],
  templateUrl: './displacement-visualization.component.html',
  styleUrl: './displacement-visualization.component.scss',
})
export class DisplacementVisualizationComponent {
  @Input() size:number = 512; 
  @Input() yokes = signal<{sensors:number[]}[]>([]);
  @Input() measurementProbeType:ProbeType = null!;
  @Input() measurementProbes:Probe[] = [];
  @Input() coil:Coil = null!;
  @Input() coiltype:Coiltype = null!;
  @Input() measurementSetting:MeasurementSetting = null!;

  public calcResults:{ x: number; y: number, angle:number, length:number }[][] = [];

  averageLength:number = 0;

  public readonly radToDeg = 180 / Math.PI;

  public hoveredArrow:{branchIndex:number, sensorIndex:number}|null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public isHoveringOverBorder:boolean = false;

  constructor(private displacementCalculationService:DisplacementCalculationService) {
    //this.yokes.set([
    //  { sensors: [1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7] },
    //  { sensors: [1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051] },
    //  { sensors: [1161.2, 1423, 1744.1, 1807.6, 1472.1, 1139.1] }
    //]);
    
    effect(() => {
      // Re-run updateVisualization whenever any of these signals/inputs change
      this.yokes();
      this.measurementProbeType;
      this.measurementProbes;
      this.coil;
      this.coiltype;
      this.measurementSetting;
      this.updateVisualization();
    });
  }

  public updateVisualization():void {
    const result = this.displacementCalculationService.calculateYokeData(
      this.yokes(),
      this.measurementProbeType,
      this.measurementProbes,
      this.coiltype,
      this.coil,
      this.measurementSetting
    );

    this.calcResults = result.map(branch => {
      return branch.map(sensor => {
        const length = this.calculateVectorLength(sensor.x, sensor.y);
        const angle = this.calculateVectorAngle(sensor.x, sensor.y);
        return { x: sensor.x, y: sensor.y, angle, length };
      });
    });

    this.averageLength = this.yokeVectors.reduce((sum, vector) => sum + vector.length, 0) / this.yokeVectors.length;
  }

  private calculateVectorLength(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
  }
  private calculateVectorAngle(x: number, y: number): number {
    return Math.atan2(y, x);
  }

  public get internalTranslationOffset():number {
    return -(this.size/512-1)*12;
  }

  public get rotationOffset():number {
    switch (this.yokes().length) {
      case 2:
        return 180;
      case 3:
        return 210;
      case 4:
        return 180;
    }
    return 0;
  }

  public scaledBranchResultX(branch:{x:number, y:number, angle:number, length:number}, lengthDelta:number):number {
    const newLength = this.calculateVectorLength(branch.x, branch.y) / this.averageLength * 6 + lengthDelta;

    return Math.cos(branch.angle) * newLength;
  }
  public scaledBranchResultY(branch:{x:number, y:number, angle:number, length:number}, lengthDelta:number):number {
    const newLength = this.calculateVectorLength(branch.x, branch.y) / this.averageLength * 6 + lengthDelta;

    return Math.sin(branch.angle) * newLength;
  }

  public get yokeVectors(): { x: number; y: number, angle:number, length:number }[] {
    // Yoke vectors are calculated by summing up all the x and y components of each yoke
    return this.calcResults.map(branch => {
      const branchX = branch.reduce((sum, sensor) => sum + sensor.x, 0);
      const branchY = branch.reduce((sum, sensor) => sum + sensor.y, 0);
      return {
        x: branchX,
        y: branchY,
        angle: this.calculateVectorAngle(branchX, branchY),
        length: this.calculateVectorLength(branchX, branchY),
      };
    });
  }

  public get finalVector(): { x: number; y: number, angle:number, length:number } {
    // Final vector is calculated by summing up all the x and y components of each branch
    let vector = this.calcResults.reduce(
      (acc, branch) => {
        const branchX = branch.reduce((sum, sensor) => sum + sensor.x, 0);
        const branchY = branch.reduce((sum, sensor) => sum + sensor.y, 0);
        return { x: acc.x + branchX, y: acc.y + branchY };
      },
      { x: 0, y: 0 }
    );

    return {
      x: vector.x,
      y: vector.y,
      angle: this.calculateVectorAngle(vector.x, vector.y),
      length: this.calculateVectorLength(vector.x, vector.y),
    }
  }

  // TrackBy function to help Angular identify items in the *ngFor loop
  trackByBranch(index: number, branch: { sensors: number[] }): number {
    return index; // Use the index as the unique identifier
  }

  trackBySensor(index: number, sensor: number): number {
    return index; // Use the index as the unique identifier
  }

  public getArrowColor(index:number):string {
    switch (index % 4) {
      case 0: return 'red';
      case 1: return 'lime';
      case 2: return 'blue';
      case 3: return 'yellow';
      default: return 'black';
    }
  }

  public IsHoveringOverArrow(branchIndex:number, sensorIndex:number):boolean {
    return this.hoveredArrow?.branchIndex === branchIndex && this.hoveredArrow?.sensorIndex === sensorIndex;
  }
  public IsHoveringOverYokeArrow(branchIndex:number):boolean {
    return this.hoveredArrow?.branchIndex === branchIndex && this.hoveredArrow?.sensorIndex === -1;
  }
  public IsHoveringOverResultArrow():boolean {
    return this.hoveredArrow?.branchIndex === -1 && this.hoveredArrow?.sensorIndex === -1;
  }

  public onArrowMouseEnter(branchIndex:number, sensorIndex:number):void {
    this.hoveredArrow = { branchIndex, sensorIndex };
  }
  public onYokeArrowMouseEnter(branchIndex:number):void {
    this.hoveredArrow = { branchIndex, sensorIndex: -1 };
  }
  public onResultArrowMouseEnter():void {
    this.hoveredArrow = { branchIndex: -1, sensorIndex: -1 };
  }
  public onArrowMouseLeave():void {
    this.hoveredArrow = null;
  }

  public onBorderMouseEnter():void {
    this.isHoveringOverBorder = true;
  }
  public onBorderMouseLeave():void {
    this.isHoveringOverBorder = false;
  }

  @HostListener('document:mousemove', ['$event'])
  private onMouseMove(event: MouseEvent) {
    this.mousePosition = { x: event.pageX, y: event.pageY };
  }
}
