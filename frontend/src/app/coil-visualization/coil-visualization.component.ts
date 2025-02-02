import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-coil-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coil-visualization.component.html',
  styleUrl: './coil-visualization.component.scss'
})
export class CoilVisualizationComponent {
  @Input() n:number = 2;

  public get nTransforms():any[] {
    let polylines = [];
    for (let i = 0; i < this.n; i++) {
      polylines.push(this.getNTransform(i));
    }
    console.log(polylines);
    return polylines;
  }

  public getNTransform(n:number):any {
    return {
      n: n,
      rotate: 360 / this.n * n,
      width: 80 - 8 * this.n,
      distanceFromRadius: 14 + 16 * (this.n - 2),
    }
  }
}
