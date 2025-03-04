import { TestBed } from '@angular/core/testing';

import { DisplacementCalculationService } from './displacement-calculation.service';

describe('DisplacementCalculationService', () => {
  let service: DisplacementCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplacementCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
