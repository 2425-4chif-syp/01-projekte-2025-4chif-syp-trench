import { Component, HostListener, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule, DecimalPipe} from "@angular/common";
import { DisplacementService } from '../services/displacement-calculation.service';
import { CoilVisualizationComponent } from "../../coil/components/coil-visualization.component";

@Component({
  selector: 'app-displacement-visualization',
  standalone: true,
  imports: [FormsModule, DecimalPipe, CommonModule, CoilVisualizationComponent],
  templateUrl: './displacement-visualization.component.html',
  styleUrl: './displacement-visualization.component.scss',
})
export class DisplacementVisualizationComponent {
  @Input() size:number = 512; // TODO: This doesn't work right now
  @Input() yokes = signal<{sensors:number[]}[]>([]);

  averageLength:number = 0;

  // Final Vector (sum of all x and y values)
  //finalVector: { x: number; y: number, angle:number, length:number } = { x: 0, y: 0, angle:0, length:0 };

  public readonly radToDeg = 180 / Math.PI;

  public hoveredArrow:number|null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public isHoveringOverBorder:boolean = false;

  constructor(private displacementService: DisplacementService) {
    //this.yokes.set([
    //  { sensors: [1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7] },
    //  { sensors: [1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051] },
    //  { sensors: [1161.2, 1423, 1744.1, 1807.6, 1472.1, 1139.1] }
    //]);
  }

  public get coilVisualizationSize(): number {
    switch (this.yokes.length) {
      case 2:
        return 400;
      case 3:
        return 512;
      case 4:
        return 540;
      default:
        return 512;
    }
  }
  public get coilVisualizationOffset(): { x: number, y: number } {
    const offset = this.coilVisualizationOffsetUnscaled;
    return {
      x: offset.x - (this.coilVisualizationSize/2),
      y: offset.y - (this.coilVisualizationSize/2)
    };
  }
  private get coilVisualizationOffsetUnscaled(): { x: number, y: number } {
    switch (this.yokes.length) {
      case 2:
        return { x: 425, y: 450 };
      case 3:
        return { x: 474.5, y: 524.5 };
      case 4:
        return { x: 500, y: 512 };
      default:
        return { x: 500, y: 512 };
    }
  }
  public get coilVisualizationRotation(): number {
    switch (this.yokes.length) {
      case 2:
        return 0;
      case 3:
        return -(45-45/3);
      case 4:
        return 0;
      default:
        return 0;
    }
  }

  public scaledBranchResultX(branch:{x:number, y:number, angle:number, length:number}, lengthDelta:number):number {
    const newLength = this.displacementService.calculateVectorLength(branch.x, branch.y) / this.averageLength * 6 + lengthDelta;

    return Math.cos(branch.angle) * newLength;
  }
  public scaledBranchResultY(branch:{x:number, y:number, angle:number, length:number}, lengthDelta:number):number {
    const newLength = this.displacementService.calculateVectorLength(branch.x, branch.y) / this.averageLength * 6 + lengthDelta;

    return Math.sin(branch.angle) * newLength;
  }

  // Function to calculate the results using the service
  public get branchResults(): { x: number; y: number, angle:number, length:number }[] {
    this.averageLength = this.yokes().reduce((acc, branch) => {
      const sum = branch.sensors.reduce((acc, sensor) => acc + sensor, 0);
      const average = sum / branch.sensors.length;
      return acc + average;
    }, 0) / this.yokes().length;

    return this.displacementService.calculateBranchData(
      this.yokes(),
      this.yokes().length
    );
  }

  // Function to calculate the Final Vector
  public get finalVector(): { x: number; y: number, angle:number, length:number } {
    let vector = this.branchResults.reduce(
      (acc, branch) => {
        acc.x += branch.x;
        acc.y += branch.y;
        return acc;
      },
      { x: 0, y: 0 } // Initial value for the accumulator
    );

    return {
      x: vector.x,
      y: vector.y,
      angle: Math.atan2(vector.y, vector.x),
      length: this.displacementService.calculateVectorLength(vector.x, vector.y),
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

  public onArrowMouseEnter(index:number):void {
    this.hoveredArrow = index;
  }
  public onArrowMouseLeave(index:number):void {
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
