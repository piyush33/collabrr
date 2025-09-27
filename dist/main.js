"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: (origin, cb) => {
            const allowlist = [
                'http://localhost:3000',
                'https://collabrr.io',
                'https://web.postman.co',
                'https://postman.com',
            ];
            if (!origin || allowlist.includes(origin))
                return cb(null, true);
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
        credentials: false,
        maxAge: 86400,
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map