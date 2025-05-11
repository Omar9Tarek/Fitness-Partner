// src/main.ts or src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

// Global application instance for serverless environment
let app;

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  if (!app) {
    logger.log(`Starting application in ${process.env.NODE_ENV || 'development'} mode`);

    // Create NestJS application
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // CORS configuration - extremely important for proper functioning
    logger.log('Setting up CORS configuration');
    
    // Define allowed origins
    const allowedOrigins = [
      'https://fitnesspartner.vercel.app',  // Production frontend
      'http://localhost:4200',                   // Angular local development
    ];
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
          return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          logger.warn(`Blocked request from disallowed origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
      preflightContinue: false,
      optionsSuccessStatus: 204
    });

    // Add global validation pipe
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      transform: true,
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