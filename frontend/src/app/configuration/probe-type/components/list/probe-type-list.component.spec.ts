import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbeTypeListComponent } from './probe-type-list.component';

describe('MeasurementProbeTypeListComponent', () => {
  let component: ProbeTypeListComponent;
  let fixture: ComponentFixture<ProbeTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbeTypeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProbeTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
