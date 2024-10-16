import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';

@Module({
  controllers: [SampleController],
  providers: [],
})
export class SampleModule {}
