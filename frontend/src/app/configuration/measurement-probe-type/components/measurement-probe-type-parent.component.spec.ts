import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementProbeTypeParentComponent } from './measurement-probe-type-parent.component';

describe('MeasurementProbeTypeParentComponent', () => {
  let component: MeasurementProbeTypeParentComponent;
  let fixture: ComponentFixture<MeasurementProbeTypeParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementProbeTypeParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementProbeTypeParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
