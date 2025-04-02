import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementSettingsComponent } from './measurement-settings.component';

describe('MeasurementSettingsComponent', () => {
  let component: MeasurementSettingsComponent;
  let fixture: ComponentFixture<MeasurementSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
