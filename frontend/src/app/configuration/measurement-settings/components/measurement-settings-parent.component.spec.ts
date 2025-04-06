import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementSettingsParentComponent } from './measurement-settings-parent.component';

describe('MeasurementSettingsParentComponent', () => {
  let component: MeasurementSettingsParentComponent;
  let fixture: ComponentFixture<MeasurementSettingsParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementSettingsParentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementSettingsParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
