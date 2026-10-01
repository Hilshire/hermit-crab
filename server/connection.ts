import { DataSourceOptions, DataSource } from 'typeorm';
import {
  Blog, Tag, Comment,
} from './entity';
import { getDatabaseConfig } from './config';

let appDataSource: Promise<DataSource> | null = null;
export function prepareConnection() {
  if (!appDataSource) {
    appDataSource = (async () => {
      const appDataSource = new DataSource(
        Object.assign(getOption(), {
          entities: [Blog, Tag, Comment],
        }),
      );

      return appDataSource.initialize();
    })();
  }

  return appDataSource;
}

function getOption(): DataSourceOptions {
  const {
    host, port, username, password, database,
  } = getDatabaseConfig();
  const portNum = parseInt(port, 10);
  if (isNaN(portNum)) {
    throw new Error('error port');
  }
  return {
    type: 'mysql',
    host,
    port: portNum,
    username,
    password,
    database,
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: ['migration/*.js'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
  };
}
