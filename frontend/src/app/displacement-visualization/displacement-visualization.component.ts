import { Component, HostListener, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplacementService } from '../displacement-calculation.service';
import {CommonModule, DecimalPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-displacement-visualization',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgForOf, CommonModule],
  templateUrl: './displacement-visualization.component.html',
  styleUrl: './displacement-visualization.component.scss',
})
export class DisplacementVisualizationComponent {
  @Input() size:number = 512;

  // Initial values for branchAmount and sensorAmount
  displacementCalculation = {
    branchAmount: 3,
    sensorAmount: 6,
  };

  // Array to store the values of each branch and its sensors
  branches: { sensors: number[] }[] = [];

  // Array to store the calculated x and y values for each branch
  branchResults: { x: number; y: number, angle:number, length:number }[] = [];

  averageLength:number = 0;

  // Final Vector (sum of all x and y values)
  finalVector: { x: number; y: number, angle:number, length:number } = { x: 0, y: 0, angle:0, length:0 };

  public readonly radToDeg = 180 / Math.PI;

  public hoveredArrow:number|null = null;
  public mousePosition: { x: number, y: number }|null = null;

  public isHoveringOverBorder:boolean = false;

  constructor(private displacementService: DisplacementService) {
    this.generateBranches(); // Initialize the branches array

    this.branches = [
      { sensors: [1069.7, 1351.4, 1723.8, 1826.3, 1452.2, 1091.7] },
      { sensors: [1015.9, 1325.5, 1667.3, 1670.4, 1351.4, 1051] },
      { sensors: [1161.2, 1423, 1744.1, 1807.6, 1472.1, 1139.1] }
    ];

    this.calculateResults();
  }

  // Function to generate the branches and sensors structure
  generateBranches(): void {
    const newBranches = [];
    for (let i = 0; i < this.displacementCalculation.branchAmount; i++) {
      const sensors = new Array(this.displacementCalculation.sensorAmount).fill(0);
      newBranches.push({ sensors });
    }
    this.branches = newBranches; // Assign the new branches array
    this.calculateResults(); // Calculate results whenever branches are generated
  }

  // Function to update the branches and sensors when branchAmount or sensorAmount changes
  updateBranches(): void {
    this.generateBranches();
  }

  // Function to calculate the results using the service
  calculateResults(): void {
    this.branchResults = this.displacementService.calculateBranchData(
      this.branches,
      this.displacementCalculation.branchAmount
    );

    this.averageLength = this.branchResults
      .reduce((acc, branch) => acc + branch.length, 0) / this.branchResults.length;

    this.calculateFinalVector(); 
  }

  // Function to calculate the Final Vector
  calculateFinalVector(): void {
    let vector = this.branchResults.reduce(
      (acc, branch) => {
        acc.x += branch.x;
        acc.y += branch.y;
        return acc;
      },
      { x: 0, y: 0 } // Initial value for the accumulator
    );

    this.finalVector = {
      x: vector.x,
      y: vector.y,
      angle: Math.atan2(vector.y, vector.x),
      length: this.displacementService.calculateVectorLength(vector.x, vector.y),
    }
  }

  // Function to handle sensor input changes
  onSensorInput(branchIndex: number, sensorIndex: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // Update the sensor value in the branches array
    this.branches[branchIndex].sensors[sensorIndex] = value ? parseFloat(value) : 0;

    // Recalculate results
    this.calculateResults();
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
