import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { loadEnvConfig } from '@next/env';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from './connection';

loadEnvConfig(process.cwd(), false);

// Running migrations must never synchronize the schema or execute migrations twice.
const options = getDataSourceOptions();
if (options.type === 'sqlite' && options.database !== ':memory:') {
  mkdirSync(dirname(options.database), { recursive: true });
}
export default new DataSource({ ...options, synchronize: false, migrationsRun: false });
