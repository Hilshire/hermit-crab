interface MysqlDatabaseConfig {
  type: 'mysql';
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

interface SqliteDatabaseConfig {
  type: 'sqlite';
  database: string;
}

export type DatabaseConfig = MysqlDatabaseConfig | SqliteDatabaseConfig;

const DEFAULT_DEVELOPMENT_SECRET = 'hermit-crab-development-secret';
const DEFAULT_DEVELOPMENT_CLAIM_HASH = '$2a$10$TdJSRtrMuMJyI27NdahHrOVBZJ1i39XUOLqVNQDiFh4fXft80xSEi';

function getRequiredEnv(name: string, developmentDefault?: string) {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'development' && developmentDefault) return developmentDefault;
  throw new Error(`Missing required environment variable: ${name}`);
}

export function getJwtSecret() {
  return getRequiredEnv('SECRET_KEY', DEFAULT_DEVELOPMENT_SECRET);
}

export function getClaimHash() {
  return getRequiredEnv('CLAIM', DEFAULT_DEVELOPMENT_CLAIM_HASH);
}

export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const type = process.env.DATABASE_TYPE || 'sqlite';

  if (type === 'sqlite') {
    return {
      type,
      database: process.env.DATABASE_PATH || 'db/hermit-crab.sqlite',
    };
  }

  if (type !== 'mysql') {
    throw new Error(`Unsupported database type: ${type}`);
  }

  if (isProduction) {
    return {
      type,
      host: getRequiredEnv('DATABASE_HOST'),
      port: getRequiredEnv('DATABASE_PORT'),
      username: getRequiredEnv('DATABASE_USERNAME'),
      password: getRequiredEnv('DATABASE_PASSWORD'),
      database: getRequiredEnv('DATABASE_NAME'),
    };
  }

  return {
    type,
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || '3306',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'blog',
  };
}
