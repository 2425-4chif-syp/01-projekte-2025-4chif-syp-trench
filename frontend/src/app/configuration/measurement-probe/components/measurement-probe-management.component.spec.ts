import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementProbeManagementComponent } from './measurement-probe-management.component';

describe('MeasurementProbeManagementComponent', () => {
  let component: MeasurementProbeManagementComponent;
  let fixture: ComponentFixture<MeasurementProbeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementProbeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementProbeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
