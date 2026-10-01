import { DataSource } from 'typeorm';
import { getClaimHash, getDatabaseConfig, getJwtSecret } from '@server/config';
import { getDataSourceOptions } from '@server/connection';

const databaseVariables = [
  'DATABASE_TYPE',
  'DATABASE_PATH',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'SECRET_KEY',
  'CLAIM',
] as const;
const originalEnvironment = Object.fromEntries(
  databaseVariables.map((name) => [name, process.env[name]]),
);
const originalNodeEnv = process.env.NODE_ENV;
const environment = process.env as Record<string, string | undefined>;

function restoreEnvironment() {
  databaseVariables.forEach((name) => {
    const value = originalEnvironment[name];
    if (value === undefined) delete environment[name];
    else environment[name] = value;
  });
  if (originalNodeEnv === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = originalNodeEnv;
}

describe('SQLite connection', () => {
  afterEach(restoreEnvironment);

  it('uses SQLite by default in development', () => {
    databaseVariables.forEach((name) => delete environment[name]);
    environment.NODE_ENV = 'development';

    expect(getDatabaseConfig()).toEqual({
      type: 'sqlite',
      database: 'db/hermit-crab.sqlite',
    });
  });

  it('provides development-only admin credentials when none are configured', () => {
    databaseVariables.forEach((name) => delete environment[name]);
    environment.NODE_ENV = 'development';

    expect(getJwtSecret()).toBe('hermit-crab-development-secret');
    expect(getClaimHash()).toBe('$2a$10$TdJSRtrMuMJyI27NdahHrOVBZJ1i39XUOLqVNQDiFh4fXft80xSEi');
  });

  it('runs the initial migration for a production SQLite database', async () => {
    databaseVariables.forEach((name) => delete environment[name]);
    environment.NODE_ENV = 'production';
    environment.DATABASE_PATH = ':memory:';
    const dataSource = new DataSource(getDataSourceOptions());

    await dataSource.initialize();
    await expect(dataSource.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'blog'"))
      .resolves.toEqual([{ name: 'blog' }]);
    await expect(dataSource.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'blog_tags_tag'"))
      .resolves.toEqual([{ name: 'blog_tags_tag' }]);
    await dataSource.destroy();
  });
});
