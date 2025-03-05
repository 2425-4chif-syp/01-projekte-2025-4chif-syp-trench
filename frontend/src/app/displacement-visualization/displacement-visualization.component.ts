import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplacementService } from '../displacement-calculation.service';
import {DecimalPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-displacement-visualization',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgForOf],
  templateUrl: './displacement-visualization.component.html',
  styleUrl: './displacement-visualization.component.scss',
})
export class DisplacementVisualizationComponent {
  @Input() size:number = 512;

  // Initial values for branchAmount and sensorAmount
  displacementCalculation = {
    branchAmount: 3,
    sensorAmount: 1,
  };

  // Array to store the values of each branch and its sensors
  branches: { sensors: number[] }[] = [];

  // Array to store the calculated x and y values for each branch
  branchResults: { x: number; y: number, angle:number }[] = [];

  // Final Vector (sum of all x and y values)
  finalVector: { x: number; y: number, angle:number } = { x: 0, y: 0, angle:0 };

  public readonly radToDeg = 180 / Math.PI;

  constructor(private displacementService: DisplacementService) {
    this.generateBranches(); // Initialize the branches array
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
    this.calculateFinalVector(); // Calculate the Final Vector
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
    console.log('Arrow', index, 'entered');
  }
  public onArrowMouseLeave(index:number):void {
    console.log('Arrow', index, 'left');  
  }
}
