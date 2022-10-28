import { Module } from '@nestjs/common';
import { FunctionsController } from '../functions/functions.controller';
import { FunctionsService } from '../functions/functions.service';
import { functions_path, UtilFunctionsService } from '@evaluator-backend/util-functions';

import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController, FunctionsController],
  providers: [
    FunctionsService,
    UtilFunctionsService,
    {
      provide: 'FUNCTIONS_PATH', useValue: functions_path
    }
  ],
})
export class AppModule { }
