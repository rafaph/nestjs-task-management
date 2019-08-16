import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

interface ServerConfig {
    port: number;
}

async function bootstrap() {
    const serverConfig: ServerConfig = config.get('server');
    const logger = new Logger('bootstrap');
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    const port = process.env.PORT || serverConfig.port;

    if (process.env.NODE_ENV === 'development') {
        app.enableCors();
    } else {
        app.enableCors({
            origin: 'https://rafaph.github.io/task-management-frontend'
        });
    }

    await app.listen(port, '0.0.0.0');
    logger.log(`Application listening on port ${port}...`);
}

bootstrap();
