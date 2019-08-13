import * as config from 'config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseConfig {
    type: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
}

const dbConfig: DatabaseConfig = config.get('db');

const port = process.env.RDS_PORT
    ? parseInt(process.env.RDS_PORT, 10)
    : dbConfig.port;

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: dbConfig.type,
    host: process.env.RDS_HOSTNAME || dbConfig.host,
    port,
    username: process.env.RDS_USERNAME || dbConfig.username,
    password: process.env.RDS_PASSWORD || dbConfig.password,
    database: process.env.RDS_DB_NAME || dbConfig.database,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: process.env.TYPEORM_SYNC === 'true' || dbConfig.synchronize
};
