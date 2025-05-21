import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbeTypeParentComponent } from './probe-type-parent.component';

describe('MeasurementProbeTypeParentComponent', () => {
  let component: ProbeTypeParentComponent;
  let fixture: ComponentFixture<ProbeTypeParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbeTypeParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProbeTypeParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
