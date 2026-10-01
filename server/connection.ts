import { mkdir } from 'fs/promises';
import { dirname, isAbsolute, resolve } from 'path';
import { DataSourceOptions, DataSource } from 'typeorm';
import {
  Blog, Tag, Comment,
} from './entity';
import { getDatabaseConfig } from './config';
import { InitialSqliteSchema1700000000000 } from './migrations/1700000000000-initial-sqlite-schema';

let appDataSource: Promise<DataSource> | null = null;
export function prepareConnection() {
  if (!appDataSource) {
    appDataSource = (async () => {
      const options = getDataSourceOptions();
      if (options.type === 'sqlite' && options.database !== ':memory:') {
        await mkdir(dirname(options.database), { recursive: true });
      }
      const appDataSource = new DataSource(options);

      return appDataSource.initialize();
    })();
  }

  return appDataSource;
}

export function getDataSourceOptions(): DataSourceOptions {
  const config = getDatabaseConfig();
  const common = {
    entities: [Blog, Tag, Comment],
    synchronize: process.env.NODE_ENV !== 'production',
  };

  if (config.type === 'sqlite') {
    const database = config.database === ':memory:' || isAbsolute(config.database)
      ? config.database
      : resolve(process.cwd(), config.database);
    return {
      ...common,
      type: 'sqlite',
      database,
      migrations: [InitialSqliteSchema1700000000000],
      migrationsRun: process.env.NODE_ENV === 'production',
    };
  }

  const {
    host, port, username, password, database,
  } = config;
  const portNum = parseInt(port, 10);
  if (isNaN(portNum)) {
    throw new Error('error port');
  }
  return {
    ...common,
    type: 'mysql',
    host,
    port: portNum,
    username,
    password,
    database,
    migrations: ['migration/*.js'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
  };
}
