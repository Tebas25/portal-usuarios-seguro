import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KmsService } from './kms/kms.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, KmsService],
})
export class AppModule {}
