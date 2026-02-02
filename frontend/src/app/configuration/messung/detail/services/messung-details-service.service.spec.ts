import { TestBed } from '@angular/core/testing';

import { MessungDetailsServiceService } from './messung-details-service.service';

describe('MessungDetailsServiceService', () => {
  let service: MessungDetailsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessungDetailsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
