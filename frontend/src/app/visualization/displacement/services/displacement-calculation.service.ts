import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DisplacementService {
  constructor() {}

  // Function to calculate the x and y values of the vectors
  calculateBranchData(branches: { sensors: number[] }[], numberOfBranches: number): { x: number; y: number, angle:number, length:number }[] {
    return branches.map((branch, index) => {
      // Calculate the average value of sensors for the current branch
      const sum = branch.sensors.reduce((acc, sensor) => acc + sensor, 0);
      const average = sum / branch.sensors.length;

      // Calculate the angle of the branch using the formula: (2π / numberOfBranches) * index
      const angle = (2 * Math.PI / numberOfBranches) * index;

      // Calculate the x and y values
      const x = Math.cos(angle) * average;
      const y = Math.sin(angle) * average;

      return { x: x, y: y, angle: angle, length: average };
    });
  }

  public calculateVectorLength(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
  }
}
