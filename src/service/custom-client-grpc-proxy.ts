import { Metadata } from '@grpc/grpc-js';
import {
  ClientGrpc,
  ClientGrpcProxy,
  RpcException,
} from '@nestjs/microservices';
import * as rTracer from 'cls-rtracer';

export default class CustomClientGrpcProxy
  extends ClientGrpcProxy
  implements ClientGrpc
{
  private serviceName: string;
  getService<T extends {}>(name: string): T {
    this.serviceName = name;
    const service = super.getService<T>(name);
    const grpcService = {} as T;
    const protoMethods = Object.keys(service);
    protoMethods.forEach((m) => {
      grpcService[m] = (...args: unknown[]) => {
        args[1] = this.addCorrelationId(args[1] as Metadata);
        return service[m](...args);
      };
    });
    return grpcService;
  }

  serializeError(err) {
    const data = {
      code: err.code,
      message: err.details,
      details: (this.serviceName ? `[${this.serviceName}] ` : '') + err.message,
      metadata: err.metadata,
    };
    return new RpcException(data);
  }

  private addCorrelationId(metadata: Metadata) {
    const correlationId = rTracer.id() as string;

    if (correlationId) {
      metadata = metadata ? metadata : new Metadata();
      metadata.add('x-correlation-id', correlationId);
    }

    return metadata;
  }
}
