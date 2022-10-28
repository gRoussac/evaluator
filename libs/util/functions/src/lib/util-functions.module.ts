import { Module } from '@nestjs/common';
import { UtilFunctionsService } from './util-functions.service';

@Module({
  controllers: [],
  providers: [UtilFunctionsService],
  exports: [UtilFunctionsService],
})
export class UtilFunctionsModule {}
