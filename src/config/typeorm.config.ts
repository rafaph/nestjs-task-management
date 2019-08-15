import * as config from 'config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseConfig {
    type: 'postgres';
    url: string;
    synchronize: boolean;
}

const dbConfig: DatabaseConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: dbConfig.type,
    url: process.env.DATABASE_URL || dbConfig.url,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: process.env.TYPEORM_SYNC === 'true' || dbConfig.synchronize
};
