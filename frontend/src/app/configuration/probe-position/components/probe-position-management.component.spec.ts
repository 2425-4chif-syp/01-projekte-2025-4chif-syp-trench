import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbePositionManagementComponent } from './probe-position-management.component';

describe('ProbePositionManagementComponent', () => {
  let component: ProbePositionManagementComponent;
  let fixture: ComponentFixture<ProbePositionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbePositionManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProbePositionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
