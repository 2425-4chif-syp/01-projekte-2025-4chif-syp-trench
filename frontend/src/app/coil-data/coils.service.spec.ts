import { TestBed } from '@angular/core/testing';

import { CoilsService } from './coils.service';

describe('CoilsService', () => {
  let service: CoilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
