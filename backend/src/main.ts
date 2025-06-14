import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for HTTPS
  app.enableCors({
    origin: [
      'https://localhost:3000',
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();