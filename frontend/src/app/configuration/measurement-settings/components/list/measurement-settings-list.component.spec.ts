import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementSettingsListComponent } from './measurement-settings-list.component';

describe('MeasurementSettingsListComponent', () => {
  let component: MeasurementSettingsListComponent;
  let fixture: ComponentFixture<MeasurementSettingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementSettingsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeasurementSettingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
