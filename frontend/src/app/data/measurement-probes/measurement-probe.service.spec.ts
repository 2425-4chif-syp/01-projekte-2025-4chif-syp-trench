import { TestBed } from '@angular/core/testing';

import { MeasurementProbeService } from './measurement-probe.service';

describe('MeasurementProbeService', () => {
  let service: MeasurementProbeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurementProbeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
