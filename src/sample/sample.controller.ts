import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ClientGrpc } from '@nestjs/microservices';
import {
  SampleServiceClient,
  SAMPLE_SERVICE_NAME,
} from 'src/service/interfaces/sample-service.interface';

@Controller('sample')
export class SampleController {
  constructor(
    @Inject(SAMPLE_SERVICE_NAME)
    private sampleServiceClient: SampleServiceClient,
  ) {}

  @Get('hello')
  async getHello() {
    return await this.sampleServiceClient.getHello({});
  }

  @Post('name')
  async addName(@Body('name') name: string) {
    return await this.sampleServiceClient.addName({ name });
  }
}
