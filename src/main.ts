import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // AI requests carry a space's cards (up to 200); the default 100kb is too small.
  app.useBodyParser('json', { limit: '1mb' });
  app.enableCors({
    origin: (origin, cb) => {
      const allowlist = [
        'http://localhost:3000',
        'https://collabrr.io',
        'https://web.postman.co',
        'https://postman.com',
      ];
      // Allow same-origin/server-to-server (no Origin header)
      if (!origin || allowlist.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Origin',
      'Accept',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Org-Id',
    ],
    credentials: false, // set to false if you don’t actually use cookies/auth via browser credentials
    maxAge: 86400,
  });

  await app.listen(3000);
}
bootstrap();
