import { Injectable } from '@nestjs/common';
import { UtilFunctionsService } from '@evaluator-backend/util-functions';

@Injectable()
export class FunctionsService {
  constructor(private readonly utilFunctionsService: UtilFunctionsService) { }

  findAll() {
    return this.utilFunctionsService.getFunctions();
  }
}