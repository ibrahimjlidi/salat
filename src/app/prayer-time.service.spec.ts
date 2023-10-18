import { TestBed } from '@angular/core/testing';

import { PrayerTimeService } from './prayer-time.service';

describe('PrayerTimeService', () => {
  let service: PrayerTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrayerTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
