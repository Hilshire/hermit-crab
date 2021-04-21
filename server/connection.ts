import { getConnectionOptions, createConnection, getConnection } from "typeorm";
import { Blog, Tag } from '../server/entity'
import { getEnv } from "../util";

let connectionReadyPromise: Promise<void> | null = null;

export function prepareConnection() {
  if (!connectionReadyPromise) {
    connectionReadyPromise = (async () => {
      // clean up old connection that references outdated hot-reload classes
      try {
        const staleConnection = getConnection(getEnv());
        await staleConnection.close();
      } catch (error) {
        // no stale connection to clean up
      }

      const connectionOptions = await getConnectionOptions(getEnv());
      await createConnection(
          Object.assign(connectionOptions, {
              entities: [ Blog, Tag ]
          })
      )
    })();
  }

  return connectionReadyPromise;
}