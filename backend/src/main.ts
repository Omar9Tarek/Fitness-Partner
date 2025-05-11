import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

// Global application instance for serverless environment
let app;

async function bootstrap() {
  // Only load dotenv in development
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

  const logger = new Logger('Bootstrap');
  
  if (!app) {
    logger.log(`Starting application in ${process.env.NODE_ENV || 'development'} mode`);

    // Create NestJS application
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // CORS configuration
    app.enableCors({
      origin: [
        'https://fitnesspartner.vercel.app',  //frontend
        'http://localhost:3000',                   // Local development
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization',
    });

    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    // Only listen to a port in non-serverless environments
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      logger.log(`Application running on: http://localhost:${port}`);
    } else {
      // In production serverless, just initialize the app
      await app.init();
      logger.log('Application initialized in serverless environment');
    }
  }
  
  return app;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export for serverless
export default bootstrap;