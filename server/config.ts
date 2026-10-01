interface DatabaseConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getJwtSecret() {
  return getRequiredEnv('SECRET_KEY');
}

export function getClaimHash() {
  return getRequiredEnv('CLAIM');
}

export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      host: getRequiredEnv('DATABASE_HOST'),
      port: getRequiredEnv('DATABASE_PORT'),
      username: getRequiredEnv('DATABASE_USERNAME'),
      password: getRequiredEnv('DATABASE_PASSWORD'),
      database: getRequiredEnv('DATABASE_NAME'),
    };
  }

  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || '3306',
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'blog',
  };
}
