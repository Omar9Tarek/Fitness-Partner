import { INestApplication } from '@nestjs/common';
import bootstrap from './main';

let app: INestApplication;

// Handler for Vercel serverless environment
export default async function handler(req, res) {
  try {
    if (!app) {
      app = await bootstrap();
    }
    
    // Get the underlying HTTP adapter from Nest
    const httpAdapter = app.getHttpAdapter();
    
    // Process the request using the Nest HTTP adapter
    await httpAdapter.getInstance()(req, res);
  } catch (error) {
    console.error('Serverless error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}