import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import CustomClientGrpcProxy from './custom-client-grpc-proxy';
import {
  SAMPLE_SERVICE_NAME,
  SAMPLESERVICE_PACKAGE_NAME,
  SampleServiceClient,
} from './interfaces/sample-service.interface';

@Global()
@Module({
  providers: [
    {
      provide: SAMPLE_SERVICE_NAME,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new CustomClientGrpcProxy({
          package: SAMPLESERVICE_PACKAGE_NAME,
          protoPath: join(__dirname, './proto/sample_service.proto'),
          url: configService.get('SAMPLE_SERVICE_URL'),
        });
        return client.getService<SampleServiceClient>(SAMPLE_SERVICE_NAME);
      },
    },
  ],
  exports: [SAMPLE_SERVICE_NAME],
})
export class ServiceModule {}
