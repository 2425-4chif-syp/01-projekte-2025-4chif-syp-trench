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
  @Input() n:number = 0;
  @Input() bb:number = 0;
  @Input() dm:number = 0;
  @Input() size:number = 512;

  public get nTransforms():any[] {
    let polylines = [];
    for (let i = 0; i < this.n; i++) {
      polylines.push(this.getNTransform(i));
    }
    
    return polylines;
  }

  public get coreRadius():number {
    return ((this.dm - this.bb*2) / 4) / 512 * this.size;
  }
  public get strokeWidth():number {
    return 5 / 512 * this.size;
  }

  public getNTransform(n:number):any {
    const delta = this.coreRadius / 64;

    return {
      n: n,
      radius: 64 / 512 * this.size,
      rotate: 360 / this.n * n,
      width: (80 - 8 * this.n) * delta,
      height: (this.bb / 4) / 512 * this.size,
      distanceFromRadius: (32 * Math.sqrt(this.n - 2)) * delta,
    }
  }
}
