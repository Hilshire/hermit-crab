import { DataSourceOptions, DataSource } from 'typeorm';
import {
  Blog, Tag, Comment,
} from './entity';

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
  return {
    type: "postgres",
    url: process.env.NEON_DATABASE_URL,
    synchronize: false,
    ssl: {
      rejectUnauthorized: false
    },
    extra: {
      max: 10
    },
    logging: ["error"],
  };
}
