import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-coil-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coil-visualization.component.html',
  styleUrl: './coil-visualization.component.scss'
})
export class CoilVisualizationComponent {
  @Input() n:number = 0;
  @Input() size:number = 512;
  public imageLoadError = signal<boolean>(false);
  public imageLoaded = signal<boolean>(false);

  public get svgUrl(): string {
    return `/assets/svg/${this.n}RJ.svg`;
  }

  public onImageLoadStart(): void {
    this.imageLoaded.set(false);
    this.imageLoadError.set(false);
  }

  public onImageLoad(): void {
    this.imageLoaded.set(true);
    this.imageLoadError.set(false);
  }
  
  public onImageError(): void {
    this.imageLoadError.set(true);
    this.imageLoaded.set(false);
    console.error(`Error loading image: ${this.svgUrl}`);
  }

  public get rotationOffset(): number {
    switch (this.n) {
      case 2:
        return 0;
      case 3:
        return 0;
      case 4:
        return 0;
    }
    return 0;
  }
  public get positionOffset(): {x: number, y: number } {
    switch (this.n) {
      case 2:
        return { x: 0, y: -0.113 };
      case 3:
        return { x: 0, y: 0.022 };
      case 4:
        return { x: 0, y: 0 };
    }
    return { x: 0, y: 0 };

  }
}
