import { TestBed } from '@angular/core/testing';

import { PuppeteerService } from './puppeteer.service';

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuppeteerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
