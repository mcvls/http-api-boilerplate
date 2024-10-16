import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { AppException } from 'src/common/exceptions/app.exception';
import { GRPCStatusToHttpStatusMap } from '../app.constants';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as Response;
    let untrustedException = false;

    if (exception instanceof AppException) {
      const appException = exception as AppException;
      if (appException.sendToLog) Logger.error(exception);
      response
        .status(appException.getStatus())
        .send(appException.externalMessage);
      untrustedException = !appException.isOperational;
    } else if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
      });
      Logger.error(exception);
    } else if (exception instanceof RpcException) {
      Logger.error(exception);
      exception = exception as any;
      const status =
        GRPCStatusToHttpStatusMap[exception.error?.code] ??
        HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json({
        statusCode: status,
        message: exception.message ?? 'Service call error',
      });
    } else {
      Logger.error(exception);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      });
      untrustedException = true;
    }

    if (untrustedException) {
      Logger.error(
        `Untrusted exception occured, signaling app for termination`,
      );
      process.kill(process.pid, 'SIGTERM');
    }
  }
}
