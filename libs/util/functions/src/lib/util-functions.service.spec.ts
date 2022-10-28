import { Test } from '@nestjs/testing';
import { UtilFunctionsService } from './util-functions.service';

describe('UtilFunctionsService', () => {
  let service: UtilFunctionsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UtilFunctionsService],
    }).compile();

    service = module.get(UtilFunctionsService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
