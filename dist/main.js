"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'https://bidly-front-end.vercel.app',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    const PORT = process.env.NODE_ENV === 'production'
        ? 3000
        : 3001;
    const HOST = '0.0.0.0';
    app.enableCors();
    await app.listen(PORT, HOST);
}
bootstrap();
//# sourceMappingURL=main.js.map