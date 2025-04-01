import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoilVisualizationComponent } from './coil-visualization.component';

describe('CoilVisualizationComponent', () => {
  let component: CoilVisualizationComponent;
  let fixture: ComponentFixture<CoilVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoilVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoilVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
