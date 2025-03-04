import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-displacement-visualization',
  standalone: true,
  imports: [FormsModule, NgForOf],
  templateUrl: './displacement-visualization.component.html',
  styleUrl: './displacement-visualization.component.scss',
})
export class DisplacementVisualizationComponent {
  // Initial values for branchAmount and sensorAmount
  displacementCalculation = {
    branchAmount: 1,
    sensorAmount: 1,
  };

  // Array to store the values of each branch and its sensors
  branches: { sensors: number[] }[] = [];

  constructor() {
    this.generateBranches(); // Initialize the branches array
  }

  // Function to generate the branches and sensors structure
  generateBranches(): void {
    this.branches = [];
    for (let i = 0; i < this.displacementCalculation.branchAmount; i++) {
      const sensors = new Array(this.displacementCalculation.sensorAmount).fill(0);
      this.branches.push({ sensors });
    }
  }

  // Function to update the branches and sensors when branchAmount or sensorAmount changes
  updateBranches(): void {
    this.generateBranches();
  }
}
