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
}
