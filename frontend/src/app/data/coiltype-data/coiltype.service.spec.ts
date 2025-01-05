import { TestBed } from '@angular/core/testing';

import { CoiltypeService } from './coiltype.service';

describe('CoiltypeService', () => {
  let service: CoiltypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoiltypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
