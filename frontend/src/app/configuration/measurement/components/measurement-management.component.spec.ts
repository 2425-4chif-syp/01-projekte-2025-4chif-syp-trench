import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MQTTMeasurementComponent } from './measurement-management.component';

describe('MeasurementManagementComponent', () => {
  let component: MQTTMeasurementComponent;
  let fixture: ComponentFixture<MQTTMeasurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MQTTMeasurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MQTTMeasurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
