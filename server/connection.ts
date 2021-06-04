import { getConnectionOptions, createConnection, getConnection } from 'typeorm';
import {
  Blog, Tag, Essay, Comment, Tip,
} from './entity';

let connectionReadyPromise: Promise<void> | null = null;
export function prepareConnection() {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = getConnection(process.env.NODE_ENV);
        await staleConnection.close();
      } catch (error) {
        // no stale connection to clean up
      }

      const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
      console.log('------->', process.env.NODE_ENV, connectionOptions);
      await createConnection(
        Object.assign(connectionOptions, {
          entities: [Blog, Tag, Essay, Comment, Tip],
        }),
      );
    })();
  }

  return connectionReadyPromise;
}
