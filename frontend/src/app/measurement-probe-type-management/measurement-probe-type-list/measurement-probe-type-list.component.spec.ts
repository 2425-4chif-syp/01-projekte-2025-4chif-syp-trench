import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementProbeTypeListComponent } from './measurement-probe-type-list.component';

describe('MeasurementProbeTypeListComponent', () => {
  let component: MeasurementProbeTypeListComponent;
  let fixture: ComponentFixture<MeasurementProbeTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementProbeTypeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementProbeTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
