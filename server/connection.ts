import { ConnectionOptions, createConnection, getConnection } from 'typeorm';
import {
  Blog, Tag, Essay, Comment, Tip,
} from './entity';

const {
  DATABASE_HOST: host = 'localhost',
  DATABASE_PORT: port = '3306',
  DATABASE_USERNAME: username = 'root',
  DATABASE_PASSWORD: password = '',
  DEVELOPMENT_DATABASE: devDB = 'dev',
  PRODUCTION_DATABASE: prodDB = 'prod',
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
          entities: [Blog, Tag, Essay, Comment, Tip],
        }),
      );
    })();
  }

  return connectionReadyPromise;
}

function getOption(): ConnectionOptions {
  const database = process.env.NODE_ENV === 'production' ? prodDB : devDB;
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
  };
}
