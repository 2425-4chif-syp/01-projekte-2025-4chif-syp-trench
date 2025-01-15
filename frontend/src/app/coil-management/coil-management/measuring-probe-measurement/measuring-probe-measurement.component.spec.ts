import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasuringProbeMeasurementComponent } from './measuring-probe-measurement.component';

describe('MeasuringProbeMeasurementComponent', () => {
  let component: MeasuringProbeMeasurementComponent;
  let fixture: ComponentFixture<MeasuringProbeMeasurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasuringProbeMeasurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasuringProbeMeasurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
