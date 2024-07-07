import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import multiPart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';

const bootstrap = async (): Promise<void> => {
  const port: string | number = process.env.PORT || 3000;
  const globalPrefix: string = 'api/v1';

  const app: NestFastifyApplication =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

  app.register(fastifyCookie, {
    secret: process.env.KEY,
  });
  app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    xssFilter: true,
  });
  app.register(multiPart);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application listening on http://0.0.0.0:${port}/${globalPrefix}`,
  );
};
bootstrap();
