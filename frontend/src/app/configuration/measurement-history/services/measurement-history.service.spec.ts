import { TestBed } from '@angular/core/testing';
import { MeasurementHistoryService } from './measurement-history.service';


describe('MeasurementHistoryService', () => {
  let service: MeasurementHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurementHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
