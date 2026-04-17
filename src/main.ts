import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { HttpErrorFilter } from './common/filter/http-error/http-error.filter';
import { HttpResponseInterceptor } from './common/interceptors/http-response/http-response.interceptor';
import { AuthGuard } from './common/guard/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters, interceptors and guards
  app.useGlobalGuards(new AuthGuard(reflector, jwtService));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());

  const v1ApiConfig = new DocumentBuilder()
    .setTitle('Book Review API')
    .setDescription('API for boo review system')
    .setVersion('1.0')
    // .setBasePath('api/v1')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const v1ApiDocument = SwaggerModule.createDocument(app, v1ApiConfig, {
    include: [
      // AuthModule,
    ],
  });

  SwaggerModule.setup('api/v1/docs', app, v1ApiDocument);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
