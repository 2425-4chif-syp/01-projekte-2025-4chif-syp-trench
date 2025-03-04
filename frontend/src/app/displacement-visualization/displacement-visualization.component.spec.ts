import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplacementVisualizationComponent } from './displacement-visualization.component';

describe('DisplacementVisualizationComponent', () => {
  let component: DisplacementVisualizationComponent;
  let fixture: ComponentFixture<DisplacementVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplacementVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisplacementVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
