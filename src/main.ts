import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://bidly-front-end.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  });
  const PORT = 3000;
  const HOST = '0.0.0.0';
  await app.listen(PORT, HOST);
}
bootstrap();
