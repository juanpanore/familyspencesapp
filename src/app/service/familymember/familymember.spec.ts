
import { TestBed } from '@angular/core/testing';

import { Familymember } from './familymember';

describe('Familymember', () => {
  let service: Familymember;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Familymember);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
