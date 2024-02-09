import { DataSourceOptions, DataSource } from 'typeorm';
import {
  Blog, Tag, Comment,
} from './entity';

const {
  DATABASE_HOST: host = 'localhost',
  DATABASE_PORT: port = '3306',
  DATABASE_USERNAME: username = 'root',
  DATABASE_PASSWORD: password = '',
  DATABASE_NAME: database = 'blog',
} = process.env;

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
    synchronize: true,
    migrations: ['migration/*.js'],
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
  };
}
