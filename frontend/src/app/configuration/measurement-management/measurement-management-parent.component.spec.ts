import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementManagementParentComponent } from './measurement-management-parent.component';

describe('MeasurementManagementParentComponent', () => {
  let component: MeasurementManagementParentComponent;
  let fixture: ComponentFixture<MeasurementManagementParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementManagementParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementManagementParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
