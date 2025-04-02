import { TestBed } from '@angular/core/testing';

import { CoiltypesService } from './coiltypes.service';

describe('CoiltypesService', () => {
  let service: CoiltypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoiltypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
