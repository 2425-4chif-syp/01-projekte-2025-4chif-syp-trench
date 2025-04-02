import { TestBed } from '@angular/core/testing';

import { MeasurementSettingsService } from './measurement-settings.service';

describe('MeasurementSettingsService', () => {
  let service: MeasurementSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurementSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
