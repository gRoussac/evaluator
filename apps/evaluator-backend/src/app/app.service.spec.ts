import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    xit('should return "Welcome to evaluator-backend!"', () => {
      expect(service.getData()).toEqual({
        message: 'Welcome to evaluator-backend!',
      });
    });
  });
});
