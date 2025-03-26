import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementProbeTypeManagementComponent } from '../measurement-probe-type-management.component';

describe('MeasurementProbeTypeManagementComponent', () => {
  let component: MeasurementProbeTypeManagementComponent;
  let fixture: ComponentFixture<MeasurementProbeTypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementProbeTypeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementProbeTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
