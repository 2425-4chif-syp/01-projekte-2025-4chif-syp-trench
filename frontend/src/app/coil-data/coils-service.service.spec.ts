import { TestBed } from '@angular/core/testing';

import { CoilsServiceService } from './coils-service.service';

describe('CoilsServiceService', () => {
  let service: CoilsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoilsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
