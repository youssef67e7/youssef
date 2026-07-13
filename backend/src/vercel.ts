import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

let app: any;

async function createApp(): Promise<any> {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bufferLogs: true },
  );

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.useGlobalInterceptors(new TransformInterceptor());

  nestApp.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const globalPrefix = process.env.API_PREFIX || 'api/v1';
  nestApp.setGlobalPrefix(globalPrefix);

  await nestApp.init();
  return expressApp;
}

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
}
