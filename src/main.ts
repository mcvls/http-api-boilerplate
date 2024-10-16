import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod } from '@nestjs/common';
import * as rTracer from 'cls-rtracer';
import helmet from 'helmet';
import cors from 'cors';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { CustomLoggerService } from './common/loggers/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  const allowedOrigins = ['http://localhost:4200', 'http://localhost:4300'];

  if (process.env.NODE_ENV === 'development') {
    const options: cors.CorsOptions = {
      origin: allowedOrigins,
      credentials: true,
    };

    app.enableCors(options);
  }
  app.use(cookieParser('$eCr3+k3y'));
  app.use(helmet());
  app.use(compression());
  app.use(
    rTracer.expressMiddleware({
      useHeader: true,
      headerName: 'x-correlation-id',
    }),
  );
  app.enableShutdownHooks();
  await app.listen(process.env.PORT);
  app.useLogger(app.get(CustomLoggerService));
  Logger.log(`Running on http://localhost:${process.env.PORT}`);
}
bootstrap();
