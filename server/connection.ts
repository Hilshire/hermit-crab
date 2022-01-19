import { ConnectionOptions, createConnection, getConnection } from 'typeorm';
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

let connectionReadyPromise: Promise<void> | null = null;
export function prepareConnection() {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = getConnection();
        await staleConnection.close();
      } catch (error) {
        // no stale connection to clean up
      }

      await createConnection(
        Object.assign(getOption(), {
          entities: [Blog, Tag, Comment],
        }),
      );
    })();
  }

  return connectionReadyPromise;
}

function getOption(): ConnectionOptions {
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
    cli: { migrationsDir: 'server/migration' },
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
  };
}
