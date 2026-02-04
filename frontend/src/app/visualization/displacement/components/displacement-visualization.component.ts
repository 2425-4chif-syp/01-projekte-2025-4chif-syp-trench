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
  @Input() yokeData = signal<{ x: number; y: number }[][]>([]);
  @Input() m_tot = signal<number>(0);
  @Input() probeType:ProbeType = null!;
  @Input() probes:Probe[] = [];
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
      this.yokeData();
      this.probeType;
      this.probes;
      this.coil;
      this.coiltype;
      this.measurementSetting;
      this.updateVisualization();
    });
  }

  public updateVisualization():void {
    const data = this.yokeData();
    if (!data || data.length === 0) {
      this.calcResults = [];
      this.averageLength = 1;
      return;
    }

    this.calcResults = data.map(branch => {
      return branch.map(sensor => {
        const length = this.calculateVectorLength(sensor.x, sensor.y);
        const angle = this.calculateVectorAngle(sensor.x, sensor.y);
        return { x: sensor.x, y: sensor.y, angle, length };
      });
    });

    const vectors = this.yokeVectors;
    if (!vectors || vectors.length === 0) {
      this.averageLength = 1;
      return;
    }

    const avg = vectors.reduce((sum, vector) => sum + vector.length, 0) / vectors.length;
    this.averageLength = Number.isFinite(avg) && avg > 0 ? avg : 1;
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
    switch (this.coiltype.schenkel) {
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
    const denom = Number.isFinite(this.averageLength) && this.averageLength > 0 ? this.averageLength : 1;
    const baseLen = this.calculateVectorLength(branch.x, branch.y);
    const newLength = baseLen / denom * 6 + lengthDelta - 0.125;

    return Math.cos(branch.angle) * newLength;
  }
  public scaledBranchResultY(branch:{x:number, y:number, angle:number, length:number}, lengthDelta:number):number {
    const denom = Number.isFinite(this.averageLength) && this.averageLength > 0 ? this.averageLength : 1;
    const baseLen = this.calculateVectorLength(branch.x, branch.y);
    const newLength = baseLen / denom * 6 + lengthDelta - 0.125;

    return Math.sin(branch.angle) * newLength;
  }

  public multiplyVectorByScalar(vector: { x: number; y: number, angle:number, length:number }, scalar: number): { x: number; y: number, angle:number, length:number } {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar,
      angle: vector.angle,
      length: vector.length * scalar
    };
  }

  public get yokeVectors(): { x: number; y: number, angle:number, length:number }[] {
    if (!this.calcResults || this.calcResults.length === 0) return [];
    // Yoke vectors are calculated by summing up all the x and y components of each yoke
    return this.calcResults.map(branch => {
      if (!branch || branch.length === 0) {
        return { x: 0, y: 0, angle: 0, length: 0 };
      }
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

  public get toleranceCircleRadius():number {
    return this.finalVector.length / this.averageLength / this.m_tot() * this.coiltype.toleranzbereich! * 6;
  }
  public get isWithinTolerance():boolean {
    return this.m_tot() < this.coiltype.toleranzbereich!;
  }
  public get toleranceColor():string {
    return this.isWithinTolerance ? '#00FF00' : '#FF0000';
  }

  public get toleranceMagnificationAmount():number {
    const PADDING = 1.1;

    return Math.min(
      12 / (this.toleranceCircleRadius * PADDING) / 2, 
      this.averageLength / this.finalVector.length / PADDING);
  }
  public get generalYokeAngles():number[] {
    return DisplacementCalculationService.getAngleLookup(this.yokeData().length);    
  }

  public get generalYokePositions():{ x: number; y: number }[] {
    return this.generalYokeAngles.map(angle => {
      const radianAngle = angle * Math.PI / 180;
      return {
        x: Math.cos(radianAngle),
        y: Math.sin(radianAngle)
      };
    });
  }

  public getArrowColor(index:number):string {
    switch (index % 4) {
      case 0: return '#800000';
      case 1: return '#008000';
      case 2: return '#004080';
      case 3: return '#808000';
      default: return '#000000';
    }
  }

  public isHoveringOverArrow(branchIndex:number, sensorIndex:number):boolean {
    return this.hoveredArrow?.branchIndex === branchIndex && this.hoveredArrow?.sensorIndex === sensorIndex;
  }
  public isHoveringOverYokeArrow(branchIndex:number):boolean {
    return this.hoveredArrow?.branchIndex === branchIndex && this.hoveredArrow?.sensorIndex === -1;
  }
  public isHoveringOverResultArrow():boolean {
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
  public onMouseMove(event: MouseEvent) {
    // Use client coordinates so tooltip positioned as fixed aligns with viewport
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }
}
